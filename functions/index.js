/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


/*
  TODO:

    To deploy only one function:

      firebase deploy --only functions:<functionName>

    e.g:

      firebase deploy --only functions:createGameRecord
*/


const logger = require("firebase-functions/logger");

const { 
  onCall,
  onRequest,
} = require("firebase-functions/v2/https");

// import and init firestore
const { 
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");

const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore();

// helper function to check if auth exists and is valid
function requestAuthIsValid(request, callerSignature) {
  if (!request.auth || !request.auth.uid) {
    logger.error(`${callerSignature}: request is not authenticated, aborting.`);
    return false;
  }

  return true;
}

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

// gameRecord CRUD operations
// create game record
exports.createGameRecord = onCall(async (request) => {
  if (!requestAuthIsValid(request, "createGameRecord")) {
    return;
  }

  if (!request.data || !request.data.gameRecord) {
    logger.error("createGameRecord: gameRecord data not attached, aborting.");
    return;
  }

  const { uid: userId } = request.auth; 
  const { gameRecord } =  request.data;

  logger.info("createGameRecord: recieved gameRecord data:", gameRecord);

  if (!gameRecord) {
    logger.error("createGameRecord: error: gameRecord is undefined")
  } 
  const result = await setGameRecordForUser(userId, gameRecord);

  if (result) {
    logger.info("createGameRecord: returning result to client:", result);
    return result;
  }

  return;
});

// read game records
exports.getUserGameRecords = onCall(async (request) => {
  if (!requestAuthIsValid(request, "getUserGameRecords")) {
    return;
  }

  const { uid: userId } = request.auth;

  // TODO: get everything at "/users/{userId}/gameRecords"
  const gameRecords = {};

  return gameRecords;
});

// update game record
exports.updateGameRecord = onCall(async (request) =>{
  /*
    TODO: This should be similar to createGameRecord, calling setGameRecordForUser.

    Where it differs is that it should provide the gameRecordId as the third
    argument in order to update the record in place.
  */
});  

// delete game record (won't delete global dupe for rankings... or should it?)


// TODO: WORK ON THIS MORE
// function to create a dupe, top-level gameRecord on creation of a completed user gameRecord
exports.duplicateGameRecordOnCreate = 
  onDocumentCreated('users/{userId}/gameRecords/{gameRecordId}', async (event) => {
    try {
      const { gameRecordId } = event.params;
      const gameRecordData = event.data.data();

      // bail out if record isn't complete
      if (!gameRecordData.completed) { 
        logger.info("createGameRecord: GameRecord isn't complete, not duplicating.")
        return;
      }

      // TODO: filter unnecessary fields here
      delete gameRecordData.userId;
      await setTopLevelGameRecord(gameRecordId, gameRecordData);

      // create a dupe entry in the top-level /gameRecords coll
      // const gameRecordsRef = db.collection('gameRecords');
      // await gameRecordsRef.doc(gameRecordId).set(gameRecordData);
      // logger.info(`createGameRecord: successfully created /gameRecord/${gameRecordId}:`, gameRecordData);

    }
    catch (error) {
      logger.error("createGameRecord: Error duplicating gameRecord:", error);
    }
  });


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

      // TODO: filter unnecessary fields here
      delete newGameRecordData.userId;
      await setTopLevelGameRecord(gameRecordId, newGameRecordData);

      // create a dupe entry in the top-level /gameRecords coll
      // const gameRecordsRef = db.collection('gameRecords');
      // await gameRecordsRef.doc(gameRecordId).set(newGameRecordData);
      // logger.info(`createGameRecord: successfully created /gameRecord/${gameRecordId}:`, gameRecordData);
    }
    catch (error) {
      logger.error("createGameRecord: Error duplicating gameRecord:", error);
    }
  });

async function setTopLevelGameRecord(gameRecordId, gameRecordData) {
  const gameRecordsRef = db.collection('gameRecords');
  
  try {
    const docRef = await gameRecordsRef.doc(gameRecordId).set(gameRecordData);
    logger.info(`setTopLevelGameRecord: successfully created /gameRecord/${gameRecordId}:`, gameRecordData);
    const snapshot = await docRef.get();
    const result = snapshot.data();
    logger.info("setTopLevelGameRecord: resultant data:", result);
    return result;
  }
  catch (error) {
    logger.error("setTopLevelGameRecord: error getting record data:", error);
  }

  return;
}

// should only be called after auth is confirmed
async function setGameRecordForUser(userId, gameRecordData, gameRecordId = undefined) { 
  logger.info(`setGameRecordForUser: attempting to create new record in /users/${userId}/gameRecords/...`);
  const gameRecordsRef = db.collection('users').doc(userId).collection('gameRecords'); 

  let docRef;

  if (!gameRecordId) {
    // create scenario, no gameRecordId specified
    docRef = await gameRecordsRef.add(gameRecordData);
  }
  else {
    // update scenario, gameRecordId specified
    docRef = await gameRecordsRef.doc(gameRecordId).set(gameRecordData);
  }

  logger.info("setGameRecordForUser: finished creating record.")
  // return result;
  try {
    const snapshot = await docRef.get();
    const result = await snapshot.data();
    logger.info("setGameRecordForUser: resultant data:", result);
    return result;
  }
  catch (error) {
    logger.error("setGameRecordsForUser: error getting record data:", error);
  }

  return;
}