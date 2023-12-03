// See a full list of supported triggers at https://firebase.google.com/docs/functions

/*
  To deploy only one function:
    firebase deploy --only functions:<functionName>

  e.g:
    firebase deploy --only functions:createGameRecord
*/
const admin = require("firebase-admin");
admin.initializeApp();

const logger = require("firebase-functions/logger");

// for funcs that are callable from the client or via https
const { 
  onCall,
  onRequest,
} = require("firebase-functions/v2/https");

// for funcs that are scheduled (data analysis)
const {
  onMessagePublished,
} = require("firebase-functions/v2/pubsub");

// for funcs that trigger as a response to doc events
const { 
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");

// import and init firestore
const { 
  Firestore,
  Timestamp,
} = require("@google-cloud/firestore");
const db = new Firestore();

// import helper functions
const {
  hashPuzzleGrid,
  splitPuzzleGridByRowWidth,
  rotate2dArray,
  sumRowNumbers,
} = require("./shared-utils.js");

// debug flags
const DEBUG_LOG_REQUESTS = true;

// Maybe make its own module - expected keys for data
const newUserDataExpectedKeys = ["email", "password", "displayName"];
const puzzleDataExpectedKeys = [
  // not every key is necessary; they are commented out here
  // some were formerly made on the frontend and now are made here
  "author",
  "authorId",
  "colors",
  // "colNumbers",
  // "gridHash",
  "grid",
  "height",
  // "group",
  // "minimumMoves",
  "name",
  // "rowNumbers",
  "width",
];

// ===================
// CF helper functions
// ===================

/*
  checkAndReturnGameRecordIfValid - why do I need this?
  getDataWithIdFromSnapshot - return the snapshot.data with snapshot.id appended
  logRequest - logs request if DEBUG_LOG_REQUESTS flag is true
  requestAuthIsValid - check if auth exists on request and is valid
  requestHasGameRecord - check if "request.data.gameRecord" exists
  requestHasGameRecordId - check if "request.data.gameRecordId" exists 
*/

// helper function to check, log, and return resultant record.
function checkAndReturnGameRecordIfValid(gameRecordData, callerName) {
  if (gameRecordData) {
    if (DEBUG_LOG_REQUESTS) {
      logger.info(`${callerName}: returning result to client: `, gameRecordData);
    }
    return gameRecordData;
  }

  logger.error(`${callerName}: gameRecordData is null.`);
  return;
}

// helper function to get the data with an id appended from a Firestore snapshot
/**
 * A function that takes a Firestore snapshot and returns the data with its id appended.
 * @param {} snapshot a snapshot from Firestore
 * @returns {Object} the data from the snapshot with the id appended
 */
async function getDataWithIdFromSnapshot(snapshot) {
  // TODO: Probably want better error handling here - should I be returning those message objects?
  if (!snapshot) {
    logger.error("getDataWithIdFromSnapshot: snapshot not provided");
    return;
  }

  if (!snapshot.exists) {
    logger.error("getDataWithIdFromSnapshot: snapshot data does not exist");
    return;
  }

  const result = snapshot.data();
  result.id = snapshot.id;
  return result;
}

// logs the request if the DEBUG_LOG_REQUESTS flag is true
function logRequest(request, fName) {
  if (DEBUG_LOG_REQUESTS) {
    logger.log(`${fName}: received request:`, request);
  }
}

// logs the error with some info on the caller and intended action and returns 
//  an object with the error message and success status
function logAndReturnError(
  error, // the error object
  callerName, // the name of the caller
  intentMessage, // a short string describing what action failed 
) {
  if (!error && !error.message) {
    logger.error(`logAndReturnError: ${callerName} didn't pass a valid error object`);
    // not sure I like the resolution of this code path, but my own backend coding error messages
    //  probably shouldn't reach the client?
    return null;
  }

  logger.error(`${callerName}: ${intentMessage ? `${intentMessage}:` : ""} ${error}`);
  return { error: error.message, success: false }
}

/**
 * Used to return data to the client wrapped with the proper structure to indicate success to
 * the client. Should be called with any data to be returned to the client.
 * @param {*} data the successful data to be returned to the client
 * @param {string} callerName the name of caller
 * @param {string} intentMessage a short string describing what successfully completed
 * @returns 
 */
function logAndReturnSuccess(data, callerName, intentMessage) {
  if (DEBUG_LOG_REQUESTS) {
    logger.info(`${callerName}: ${intentMessage ? `${intentMessage}:` : ""}`, data);
  }

  return { data: data, success: true };
}

// creates an error message for missing data to return to the client
const createMissingDataError = (missingDataName) => ({
  error: `'${missingDataName}' was not supplied in the request`,
  errorCode: "MISSING_DATA",
  success: false,
});

// creates an error message for invalid data to return to the client
const createInvalidDataError = (invalidDataName) => ({
  error: `Provided '${invalidDataName}' is invalid`,
  errorCode: "INVALID_DATA",
  success: false,
});

// TODO: Add me to all try/catch blocks where we don't check snapshot.exists
// creates an error message for non-existant document data - when !myFirestoreSnapshot.exists
const createEmptyDocumentError = (snapshotName) => ({
  error: `The '${snapshotName}' document data does not exist.`,
  errorCode: "NONEXISTENT_DOCUMENT",
  success: false,
});

// An error message for an invalid auth to return to the client
const invalidAuthError = {
  error: "Client isn't authorized to call this function.",
  errorCode: "INVALID_AUTH",
  success: false,
};

/**
 * Checks if the auth on a request is valid.
 * @param {*} request the client's request object 
 * @param {string} callerName name of the calling function as a string
 * @returns {boolean} Whether or not the request auth is valid
 */
function requestAuthIsValid(request, callerName) {
  if (!request.auth || !request.auth.uid) {
    logger.error(`${callerName}: request is not authenticated, aborting.`);
    return false;
  }

  return true;
}

// generic function to check if some data is attached to a request
function checkIfDataExistsOnRequest(
  request, 
  dataName, 
  callerName,
  logData = false,
) {
  if (!request.data || !request.data[dataName]) {
    logger.error(`${callerName}: ${dataName} not supplied, aborting.`);
    return false;
  }

  if (logData) {
    logger.info(`${callerName}: recieved ${dataName} data:`, request.data[dataName]);
  }

  return true;
}

// checks whether the request has a gameRecord
const requestHasGameRecord = (request, callerName) => 
checkIfDataExistsOnRequest(request, "gameRecord", callerName, true);

// checks whether the request has a gameRecordId
const requestHasGameRecordId = (request, callerName) => 
checkIfDataExistsOnRequest(request, "gameRecordId", callerName);

// checks whether the request has puzzleData
const requestHasPuzzleData = (request, callerName) => 
checkIfDataExistsOnRequest(request, "puzzleData", callerName);

// checks whether the request has a puzzleId
const requestHasPuzzleId = (request, callerName) => 
  checkIfDataExistsOnRequest(request, "puzzleId", callerName);

// checks whether the request has newUserData
const requestHasNewUserData = (request, callerName) => 
  checkIfDataExistsOnRequest(request, "newUserData", callerName);

// checks whether the request has a userId
const requestHasUserId = (request, callerName) =>
  checkIfDataExistsOnRequest(request, "userId", callerName);

/**
 * Helper function to check whether user-submitted data matches what is expected. Implemented
 *  internally for specific cases. 
 * @param {Object} data the data object being validated 
 * @param {Array} expectedKeysArray an array of the expected keys of the data object 
 * @param {string} callerName the name of the calling function
 * @param {string} dataName the name of the data (gameRecordData, newUserData, etc) for logging
 * @returns {boolean} whether or not the supplied data is valid
 */
function requestDataIsValid(data, expectedKeysArray, callerName, dataName) {
  if (!data) {
    logger.error(`${callerName}: no data supplied, aborting.`);
    return false;
  }

  dataKeys = Object.keys(data);

  const dataIsValid = dataKeys.every((key) => expectedKeysArray.includes(key));

  if (!dataIsValid) {
    logger.error(`${callerName}: ${dataName} is invalid, aborting.`)
  }

  return dataIsValid;
}

const newUserDataIsValid = (newUserData, callerName) =>
  requestDataIsValid(newUserData, newUserDataExpectedKeys, callerName, "newUserData");

const puzzleDataIsValid = (puzzleData, callerName) => 
  requestDataIsValid(puzzleData, puzzleDataExpectedKeys, callerName, "puzzleData");

// ensures the newUserData only has what it needs
// TODO: probabably a candidate for writing a smart, generic function like
//  checkIfDataExistsOnRequest
// function newUserDataIsValid(newUserData, callerName) {
//   if (!newUserData) {
//     logger.error(`${callerName}: no newUserData supplied, aborting.`);
//     return false;
//   }

//   const newUserDataKeys = Object.keys(newUserData);

//   // this approach ensures that every key on newUserData is supposed to be there
//   // - inverting this makes it so it at least has everything on newUserDataExpectedKeys,
//   //   but potentially more than that
//   const newUserDataIsValid = 
//     newUserDataKeys.every((key) => newUserDataExpectedKeys.includes(key));

//   if (newUserDataIsValid) {
//     return true;
//   }

//   logger.error(`${callerName}: newUserData is invalid, aborting`);
//   return false;
// }

// Minimal test functions
exports.testParameters = onCall(async (data, context) => {
  logger.log("testParameters called");
  logger.log("testParameters: data:", data);
  logger.log("testParameters: context:", context);
});


// ==========================
// gameRecord CRUD operations
// ==========================

//TODO: Test that this still works, also triggering the proper dupe functions
// create game record
exports.createGameRecord = onCall(async (request) => {
  const fName = "createGameRecord";

  logRequest(request, fName);

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasGameRecord(request, fName)) return createMissingDataError("gameRecord");

  const { uid: userId } = request.auth; 
  const { gameRecord } = request.data;

  logger.log(`${fName}: userId is: `, userId);
  logger.log(`${fName}: gameRecord is:`, gameRecord);

  const result = await setGameRecordForUser(userId, gameRecord);

  return checkAndReturnGameRecordIfValid(result, fName);
});

// helper function to handle getting a user's game records - returns error message on error
//  assumes that the userId is valid that user exists.
//  CHECK RESULT FOR `result.error` AFTER CALLING
async function getGameRecordsFromFirestore(userId, callerName) {
  try {
    const collectionRef = db.collection(`users/${userId}/gameRecords`);
    const querySnapshot = await collectionRef.get();
    const gameRecords = {};

    querySnapshot.forEach((docSnapshot) => {
      const gameRecord = docSnapshot.data();
      const gameRecordId = docSnapshot.id;

      // TODO: eventually remove these subcollections, but just filter them out for now
      if (gameRecordId !== "achievements" && gameRecordId !== "puzzles") {
        // avoids "Invalid Date" string for dates from Firestore Timestamp
        if (gameRecord.lastPlayed && gameRecord.lastPlayed.toDate) {
          gameRecord.lastPlayed = gameRecord.lastPlayed.toDate();
        }

        gameRecord.id = gameRecordId;
        gameRecords[gameRecordId] = gameRecord;
      }
    });

    // TODO: I need to refactor this to use logAndReturnSuccess - how will this impact
    //  my client code?
    return gameRecords;
  }
  catch (error) {
    // TODO: same as above but with logAndReturnError
    logger.error(`${callerName}: error getting records:`, error);
    return { error: error.message, success: false };
  }
}

// read game records
// exports.getUserGameRecords = onCall(async (request) => {
exports.getUserGameRecords = onCall(async (request) => {
  const fName = "getUserGameRecords";
  logRequest(request, fName);

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasUserId(request, fName)) return createMissingDataError("userId");

  const { uid: userId } = request.auth;

  const result = await getGameRecordsFromFirestore(userId, fName);

  if (result.error) return result;

  return { data: result, success: true };
});

// - ensure that the dupe records are made correctly on completion
// update game record
exports.updateGameRecord = onCall(async (request) =>{
  logRequest(request, "updateGameRecord");

  if (!requestAuthIsValid(request, "updateGameRecord")) return invalidAuthError;
  if (!requestHasGameRecord(request, "updateGameRecord")) return createMissingDataError("gameRecord");
  if (!requestHasGameRecordId(request, "updateGameRecord")) return createMissingDataError("gameRecordId");

  const { uid: userId } = request.auth;
  const { gameRecord, gameRecordId } = request.data;

  const result = await setGameRecordForUser(userId, gameRecord, gameRecordId);

  return checkAndReturnGameRecordIfValid(result, "updateGameRecord");
});  

// delete game record (won't delete global dupe for rankings... or should it?)
exports.deleteGameRecord = onCall(async (request) => {
  const fName = "deleteGameRecord";

  logRequest(request, fName);

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasGameRecordId(request, fName)) return createMissingDataError("gameRecordId");

  const { uid: userId } = request.auth;
  const { gameRecordId } = request.data;
  const docPath = `/users/${userId}/gameRecords/${gameRecordId}`;

  logger.info(`${fName}: attempting to delete record at ${docPath}...`);
  const gameRecordsRef = db.collection('users').doc(userId).collection('gameRecords').doc(gameRecordId);

  try {
    await gameRecordsRef.delete();
    logger.info(`${fName}: successfully deleted doc at ${docPath}`);
    return { success: true } ;
  }
  catch (error) {
    logger.error(`${fName}: error deleting doc at ${docPath}:`, error);
    return { error: error.message, success: false };
  }
});

// deletes all game records where gameRecord.testGameRecord === true. mainly for testing and debug,
// not intended to be called in production.
// TODO: Remove after gameRecord stuff is finished
exports.deleteAllTestGameRecords = onCall(async (request) => {
  const fName = "deleteAllTestGameRecords";
  const { uid: userId } = request.auth;

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;

  try {
    const batch = db.batch();

    const testGameRecordsTopLevelSnapshot = await db.collection('gameRecords')
      // .where("testGameRecord", "==", true)
      .where("devRecord", "==", true)
      .get();
      
    const testGameRecordsSnapshot = await db.collection(`users/${userId}/gameRecords`)
      // .where("testGameRecord", "==", true)
      .where("devRecord", "==", true)
      .get();
  
    if (testGameRecordsTopLevelSnapshot.empty && testGameRecordsSnapshot.empty) {
      logger.log(`${fName}: No test game records found.`);
      return;
    }
      
    // top-level records
    testGameRecordsTopLevelSnapshot.forEach((doc) => {
      batch.delete(doc.ref); 
    });
    
    // user records
    testGameRecordsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.log(`${fName}: All top-level testGameRecords and testGameRecords for ${userId} successfully deleted.`)
    return { data: "All testGameRecords successfully deleted.", success: true }
  }
  catch (error) {
    logger.error(`${fName}: error getting records:`, error);
    return { error: error.message, success: false };
  }
});

// function to create a dupe, top-level gameRecord on creation of a completed user gameRecord
exports.duplicateGameRecordOnCreate = 
  onDocumentCreated('users/{userId}/gameRecords/{gameRecordId}', async (event) => {
    const fName = "duplicateGameRecordOnCreate";

    try {
      const { gameRecordId } = event.params;
      const gameRecordData = event.data.data();

      // bail out if record isn't complete
      if (!gameRecordData.completed) { 
        logger.info(`${fName}: GameRecord isn't complete, not duplicating.`)
        return;
      }

      // bail out if gameRecordId is "puzzles" or "achievements" (legacy feature)
      if (gameRecordId === "achievements" || gameRecordId === "puzzles") {
        return;
      }

      // filter unnecessary fields here
      delete gameRecordData.userId;

      await setTopLevelGameRecord(gameRecordId, gameRecordData);
    }
    catch (error) {
      logger.error(`${fName}: Error duplicating gameRecord:`, error);
    }
  });

// TODO: test this (probably in tandem with updateGameRecord and api.completeGameRecord)
// creates a top-level gameRecord dupe when !gameRecord.completed => gameRecord.completed;
exports.duplicateGameRecordOnUpdate = 
  onDocumentUpdated('users/{userId}/gameRecords/{gameRecordId}', async (event) => {
    try {
      const { gameRecordId } = event.params;
      
      const oldGameRecordData = event.data.before.data();
      const newGameRecordData = event.data.after.data();

      const hasBeenCompleted = !oldGameRecordData.completed && newGameRecordData.completed

      if (!hasBeenCompleted) { 
        logger.info("updateGameRecord: GameRecord isn't complete, not duplicating.")
        return;
      }

      // filter unnecessary fields
      delete newGameRecordData.userId;

      await setTopLevelGameRecord(gameRecordId, newGameRecordData);
    }
    catch (error) {
      logger.error("createGameRecord: Error duplicating gameRecord:", error);
    }
  });

//
async function setTopLevelGameRecord(gameRecordId, gameRecordData) {
  const gameRecordsRef = db.collection('gameRecords');
  
  try {
    const docRef = await gameRecordsRef.doc(gameRecordId).set(gameRecordData);
    logger.info(`setTopLevelGameRecord: successfully created /gameRecord/${gameRecordId}:`, gameRecordData);
    const snapshot = await docRef.get();
    // const result = snapshot.data();
    // result.id = snapshot.id;
    const result = await getDataWithIdFromSnapshot(snapshot)
    logger.info("setTopLevelGameRecord: resultant data:", result);
    return result;
  }
  catch (error) {
    logger.error("setTopLevelGameRecord: error getting record data:", error);
  }

  return;
};

// helper function for any api function that needs to add or edit a gameRecord belonging
// to a user
// should only be called after auth is confirmed
async function setGameRecordForUser(
  userId,
  // this is the initial data for create and an object with the updated fields for update 
  gameRecordData, 
  // if defined, will make this function update rather than create.
  gameRecordId = undefined
) { 
  const fName = "setGameRecordForUser";
  logger.info(`${fName} attempting to create new record in /users/${userId}/gameRecords/...`);
  
  try {
    const gameRecordsRef = db.collection('users').doc(userId).collection('gameRecords'); 
    let docRef;

    if (!gameRecordId) {
      // create scenario, no gameRecordId specified
      // add() returns the docRef
      docRef = await gameRecordsRef.add(gameRecordData);
    }
    else {
      // update scenario, gameRecordId specified
    
      // opting to use set() below rather than update() as set() will add with a specific
      //  id if the doc doesn't exist rather than throwing an error
      docRef = gameRecordsRef.doc(gameRecordId);
      // set() doesn't return a docRef, it returns a WriteResult
      await docRef.set(gameRecordData);
    }

    logger.info(`setGameRecordForUser: finished creating record.`)
    // return result;
    const snapshot = await docRef.get();
    const result = await getDataWithIdFromSnapshot(snapshot);
    return logAndReturnSuccess(result, fName, "Successfully set record:");
  }
  catch (error) {
    return logAndReturnError(error, fName, "Error getting record data");
  }
};

// ====================
// user CRUD operations
// ====================

// TODO: bring over ./firebase/api:createUserEntity
//  - mind its one use in UserContext and what it expects to take in and return
exports.createUser = onCall(async (request) => {
  const fName = "createUser";
  
  try {
    logRequest(request);

    if (!requestHasNewUserData(request, fName)) return createMissingDataError("newUserData");

    const { newUserData } = request.data;

    if (!newUserDataIsValid(newUserData, fName)) return createInvalidDataError("newUserData");

    /*
      we expect newUserData to look like this:

      {
        email: "...", 
        password: "...", 
        displayName: "...", 
      }
    */
  
    const newUserRecord = await admin.auth().createUser({ ...newUserData });
    // TODO: Currently doing nothing with verification 
    // TODO: This is probably where we'd trigger a verification email

    const newUserId = newUserRecord.uid;
    const newUserTimestamp = Timestamp.now();
    const usersCollectionRef = collection(db, "users");
    
    const newUserEntityData = {
      name: newUserRecord.displayName,
      createdTimestamp: newUserTimestamp,
      updatedTimestamp: newUserTimestamp,
    };
    
    await usersCollectionRef.doc(newUserId).set(newUserEntityData);
    return logAndReturnSuccess(newUserEntityData, fName, "Successfully created new user in firestore");
  }
  catch (error) {
    return logAndReturnError(error, fName, "Error creating new user");
  }
});

// TODO: test this function
exports.getUserProfile = onCall(async (request) => {
  const fName = "getUserProfile";

  logRequest(request, fName);

  if (!requestHasUserId(request, fName)) return createMissingDataError("userId");
  
  try {
    // here we assume we have recieved request.data.userId
    const { userId } = request.data;

    // get user profile data
    // const userProfileSnapshot = await db.collection(`users/${userId}`).get();
    const userProfileSnapshot = await db.doc(`users/${userId}`).get();
    if (!userProfileSnapshot.exists) return createEmptyDocumentError("userProfileSnapshot");
    const userProfileData = userProfileSnapshot.data();

    // get user's gameRecords
    const userGameRecords = await getGameRecordsFromFirestore(userId, fName);

    // check if records were successfully retrieved
    if (userGameRecords.error) return userGameRecords;

    // append gameRecords
    userProfileData.gameRecords = userGameRecords;

    return logAndReturnSuccess(userProfileData, fName, "Successfully fetched userProfile.");
    // return userProfileData;
  } 
  catch(error) {
    return logAndReturnError(error, fName, "Error getting user profile"); 
  }
});

// ======================
// puzzle CRUD operations
// ======================

/**
 * Processes raw puzzle data from the parser client and stores it in a game-usable format.
 * Hashes the puzzle grid, computes the row/col numbers, and tallies the minimum moves needed
 * to solve.
 * @param {Object} puzzleData the raw puzzle data object submitted from the client 
 * @returns {Object} the processed puzzle data for storage in Firestore
 */
function processPuzzleData(puzzleData) {
  // TODO: Should I do more work on processing the colors here?

  // hash and store puzzle grid
  puzzleData.gridHash = hashPuzzleGrid(puzzleData.grid, puzzleData.name);

  // split the raw grid and get a rotated copy for columns
  const splitPuzzleGrid = splitPuzzleGridByRowWidth(puzzleData.grid, puzzleData.width);
  // TODO: update this to use second arg for clockwise and avoid needing to reverse
  const rotatedPuzzleGrid = rotate2dArray(splitPuzzleGrid);
  rotatedPuzzleGrid.reverse(); // why am I doing this again?

  // =========================================================================================
  // kept from old code - I called this to set rowNumbers and colNumbers in the parser.
  //  I don't think that I need to stringify the array anymore, but keeping this here
  //  in case I need to revert.
  
  // helper function to get 2d array in a format for firestore
  // const getGridNumbers = (input) => JSON.stringify(input.map((row) => sumRowNumbers(row)));
  // =========================================================================================
  
  // compute row and column numbers
  puzzleData.rowNumbers = splitPuzzleGrid.map((row) => sumRowNumbers(row));
  puzzleData.colNumbers = rotatedPuzzleGrid.map((row) => sumRowNumbers(row));
  
  // compute minimum moves
  puzzleData.minimumMoves = puzzleData.grid.reduce((sum, current) => sum + current, 0);


  // TODO: REMOVE THIS AFTER NEW PUZZLE CODE IS WORKING
  // DEBUG: mark the puzzles created via the CF
  puzzleData.createdViaCF = true;
  
  // return processed puzzle data for storage in firestore
  return puzzleData;
}

// helper function to fetch puzzles internally 
async function getPuzzlesFromFirestore(userId = null, callerName) {
  // TODO: Assumes userId is valid if supplied

  try {
    const puzzles = [];
    const puzzlesSnapshot = await (async () => {
      // get all puzzles
      if (!userId) {
        return await db.collection("/puzzles").get();
      }

      //get puzzles for a specified userId
      return await db.collection("/puzzles").where("authorId", "==", userId).get();
    })();

    puzzlesSnapshot.forEach((puzzleDoc) => {
      if (puzzleDoc.exists) {
        const puzzle = puzzleDoc.data();
        // append puzzle id
        puzzle.id = puzzleDoc.id;

        if (!puzzle.hideMe) puzzles.push(puzzle);
      }
    });

    return logAndReturnSuccess(puzzles, callerName, "Successfully fetched puzzles");
  }
  catch (error) {
    return logAndReturnError(error, callerName, "Could not fetch puzzles");
  }
}

// Gets all puzzles for the game - called upon initial load from the client
exports.getPuzzles = onCall(async (request) => {
  // TODO: Improve this to use some sort of caching so that we don't incur Firestore reads for
  //  largely static data on every load
  const fName = "getPuzzles";

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;

  return await getPuzzlesFromFirestore(null, fName);

  // try {
  //   const puzzles = [];
  //   const puzzlesSnapshot = await db.collection("/puzzles").get();

  //   puzzlesSnapshot.forEach((puzzleDoc) => {
  //     if (puzzleDoc.exists) {
  //       const puzzle = puzzleDoc.data();
  //       // append puzzle id
  //       puzzle.id = puzzleDoc.id;

  //       if (!puzzle.hideMe) puzzles.push(puzzle);
  //     }
  //   });

  //   return logAndReturnSuccess(puzzles, fName, "Successfully fetched puzzles");
  // }
  // catch (error) {
  //   return logAndReturnError(error, fName, "Could not fetch puzzles");
  // }
});

exports.getUserPuzzles = onCall(async (request) => {
  const fName = "getUserPuzzles";

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasUserId(request, fName)) return createMissingDataError("userId");

  const { userId } = request.data;

  return await getPuzzlesFromFirestore(userId, fName);
});

// TODO: Test this in the picross parser
// TODO: prune extra comments
exports.createPuzzle = onCall(async (request) => {
  /*
    This is going to need some testing.

    You need to see where you can socket this in to the existing functionality in the 
    Picross Parser - what data do we expect to submit and when? What are we expecting
    to receive back in the client? What client code can we prune in each case?
  */
  const fName = "createPuzzle";

  logRequest(request, fName);

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasPuzzleData(request, fName)) return createMissingDataError("puzzleData");

  const { puzzleData } = request.data;

  if (!puzzleDataIsValid(puzzleData, fName)) return createInvalidDataError("puzzleData");

  /*
    we expect the submitted puzzleData to look like this:

    {
      "author": // author name as a string
      "authorId": // author id (string?)
      "colors": // array of puzzle color pallete as RGBA hex strings
      "grid": // the binary, flat array (1 filled, 0 empty) of the puzzle grid
      "height": // height of grid as an int
      "group": // (optional?) the group that the puzzle belongs to
      "name": // name of the puzzle as a string
      "width": // width of grid as an int
    }

    ... keep in mind we're not checking that it's ONLY these keys, so we could potentially
    have some extra stuff coming along for the ride. Maybe check for this?
  */

  // process the puzzle data
  const newPuzzleData = processPuzzleData(puzzleData);

  // store puzzle data in firestore
  try {
    // TODO: Check what parts of this can be abstracted to reduce reuse in updatePuzzle
    // create timestamp 
    const puzzleCreatedTimestamp = Timestamp.now();
    newPuzzleData.createdTimestamp = puzzleCreatedTimestamp;
    newPuzzleData.updatedTimestamp = puzzleCreatedTimestamp;

    // pull out the grid so the answer isn't stored with the data the client receives
    const { grid } = newPuzzleData;
    delete newPuzzleData.grid;

    // start a batch to reduce firestore write ops
    const batch = db.batch();

    // add the puzzle and append the id
    // const newPuzzleRef = await db.collection('puzzles').add(newPuzzleData);
    // this doesn't create the doc, but generates its id
    const newPuzzleRef = db.collection('puzzles').doc();
    batch.set(newPuzzleRef, newPuzzleData);
    const newPuzzleId = newPuzzleRef.id;
    newPuzzleData.id = newPuzzleId;

    // add the answer grid to a subcollection of the new puzzle
    // this object structure came from "makeGridSubdocFromGridString" in the parser client
    const gridSubdoc = { gridString: grid }; 
    const gridDocRef = db.collection(`puzzles/${newPuzzleId}/grid`).doc("answer");
    batch.set(gridDocRef, gridSubdoc);
    // await gridSubcollection.doc("answer").set(gridSubdoc);

    // commit the batch
    await batch.commit();

    return logAndReturnSuccess(newPuzzleData, fName, "Successfully created new puzzle");
  }
  catch (error) {
    return logAndReturnError(error, fName, "Puzzle creation failed");
  }
});

// TODO: Implement and test
// Updates the puzzleData for a given puzzle. Passed in as request.data.puzzleData
exports.updatePuzzle = onCall(async (request) => {
  const fName = "updatePuzzle";

  logRequest(request, fName);

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasPuzzleData(request, fName)) return;

  const { puzzleData } = request.data;

  // important consideration for this - is any of the resubmitted puzzle data already processed?
  //  can I not use processPuzzleData as a result? I'm not sure, so look how updated data is 
  //  submitted via the parser tool before we implement this
});

// TODO: test this function
exports.deletePuzzle = onCall(async (request) => {
  const fName = "deletePuzzle";

  logRequest(request, fName);

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;
  if (!requestHasPuzzleId(request, fName)) return createMissingDataError("puzzleId");

  const { puzzleId } = request.data;

  try {
    // create a batch to delete grid answer and puzzle
    const batch = db.batch();

    // delete answer grid subdoc
    // note - no considerations taken if this grid answer doc doesn't exist
    const gridAnswerRef = db.doc(`puzzles/${puzzleId}/grid/answer`);
    batch.delete(gridAnswerRef);

    // delete puzzle doc 
    const puzzleDocRef = db.doc(`puzzles/${puzzleId}`);
    batch.delete(puzzleDocRef);

    await batch.commit();
    return logAndReturnSuccess(null, fName, `Successfully deleted puzzle ${puzzleId}`);
  }
  catch (error) {
    return logAndReturnError(error, fName, `Error deleting puzzle ${puzzleId}`);
  }
});


// ==================================
// gameRecord data analysis functions
// ==================================

// These are functions that work on the data at /gameRecords to perform analysis for
// difficulty grading/overall statistics.

const DATA_ANALYSIS_PUBSUB_TOPIC = "trigger-report-generation"

// pub/sub trigger that a scheduled task will message to initiate at midnight
exports.startPuzzleReportGeneration = onMessagePublished(DATA_ANALYSIS_PUBSUB_TOPIC, (e) => {
  // This won't have a purpose until we implement the Firestore caching in generatePuzzleReports
  logger.info(
    `startPuzzleReportGeneration successfully invoked via the '${DATA_ANALYSIS_PUBSUB_TOPIC}' topic`
  );
});

// actual helper function that builds the puzzle reports
async function generatePuzzleReports(callerName = "generatePuzzleReports") {

  // to be called internally by the startPuzzleReportGeneration trigger.

  // In this early form, it will simply generate the reports on the fly each time it is 
  //  invoked. This will be called directly from getPuzzleReports.

  // eventually this will be refactored to store the puzzleReports in firestore and 
  //  use the planned caching behavior.
  
  // called when encountering first record that references a puzzle without a report
  const buildPuzzleReport = (gameRecord) => {
    const {
      puzzleGridHash,
      puzzleId,
      puzzleMinimumMoves,
      puzzleName,
    } = gameRecord;

    const defaultPuzzleReportStats = {
      averageMoves: 0,
      averageMoveTime: 0,
      averageSolveTime: 0,
      fastestSolveTime: 0,
      timesSolved: 0,
      totalMoves: 0,
      totalTime: 0,
    };

    const puzzleReport = {
      ...defaultPuzzleReportStats,
      puzzleGridHash,
      puzzleId,
      puzzleName,
      puzzleMinimumMoves,
    };

    return puzzleReport;
  };
  
  const reportExists = (puzzleId, reports) => reports[puzzleId] !== undefined;
  
  try {
    // start retrieving data and building reports here
    
    // get all top-level gameRecords (the ones living in /gameRecords)
    const collectionRef = db.collection(`/gameRecords`);
    const querySnapshot = await collectionRef.get();
    const reportsTimestamp = Timestamp.now();
    const reports = { "timestamp": reportsTimestamp, };
    const reportStartTime = Date.now();

    querySnapshot.forEach((docSnapshot) => {
      const gameRecord = docSnapshot.data();
      const { 
        puzzleId,
        moveCount,
        moveList,
        gameTimer, 
      } = gameRecord;

      // check if puzzleId exists as a key in reports
      if (!reportExists(puzzleId, reports)) {
        // if not, call buildPuzzleReport();
        const newReport = buildPuzzleReport(gameRecord);
        reports[puzzleId] = newReport;
      }

      // we now have reports[puzzleId], so update it with this current gameRecord data

      // TODO: continue here...
    });

    // TODO: Store the record at this step

    // REMEMBER: When working with Firestore timestamps, call the "toDate()"
    //  method to convert it into a format that packages up well to be shipped
    //  to the client. This was important for getGameRecordsFromFirestore.

    // convert to be shipped to client - don't do this before store
    reports["timestamp"] = reports["timestamp"].toDate();
    reports["totalReportGenerationTime"] = Date.now() - reportStartTime;
    return logAndReturnSuccess(reports, callerName, "Successfully generated puzzle reports.");
  }
  catch (error) {
    return logAndReturnError(error, callerName, "Error generating puzzle reports");
  }
}

exports.getPuzzleReports = onCall(async (request) => {
  const fName = "getPuzzleReports";

  if (!requestAuthIsValid(request, fName)) return invalidAuthError;

  // to be called by the client code to fetch the puzzleReports

  // for where we're at right now, just call generatePuzzleReports directly and return the data

  // eventually we will refactor to have it check the cached reports at /puzzleReports and return
  //  proper report based on the time and date.

  // initial implementation
  return await generatePuzzleReports(fName);
});


// TODO: Should there just be one large function that returns all of the dataAnalysis stuff?
// TODO: Should the results of the data analysis functions be stored at '/dataAnalysis'?
//  - "/gameRecordStats"?

// TODO: revise this to use onCallable? 
// Test function to return a count of all game records in the document database
exports.countGameRecords = onRequest(async (req, res) => {
  // temp variable - remove with check to permanent storage
  const cacheIsValid = false;
  // if cache is valid - serve info from cache
  if (cacheIsValid) {
    res.send("Cache is valid!")
    return;
  }
  
  // if cache is invalid (over ~6hrs since last update)
  try {
    // const gameRecords = [];
    const gameRecords = "test as a string";
    const gameRecordsSnapshot = await db.collection("gameRecords").get();

    logger.info("countGameRecords: got gameRecordsSnapshot:", gameRecordsSnapshot);

    // iterate over the batched results and add to the collection
    // results.forEach((gameRecordsSnapshot) => 
    //   gameRecordsSnapshot.forEach((gameRecordDoc) => 
    //     gameRecords.push(gameRecordDoc.data()))
    // );

    // send the gameRecords as a response
    res.status(200).json(gameRecords);
  } 
  catch (error) {
    logger.error("Error querying gameRecords:", error);
  }
});



