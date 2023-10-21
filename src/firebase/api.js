import { 
  db,
  functions,
} from "./firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";

import getDataFromApiResponse from "../utils/getDataFromApiResponse";
import convertFirestoreResponseToDataArray from "../utils/convertFirestoreResponseToDataArray";

/*
  api.js
  ------

  This is a file for the client-side api functions that 
  interact with my firebase services (mainly cloud functions)
*/


// related to old API approach
const achievementsCollectionRef = collection(db, "achievements");
const usersCollectionRef = collection(db, "users");
const puzzlesCollectionRef = collection(db, "puzzles");

// shorthand for getting a callable, assumes 'callableName' is a function that exists
const getCallable = (callableName) => httpsCallable(functions, callableName);

// global constants for API functions
const gameRecordNecessaryKeys = [
  "completed",
  "gameTimer",
  "lastPlayed",
  "moves",
  "puzzleGrid",
  "puzzleId",
  "userId",
];

// TODO: set this to true
const CHECK_GAME_RECORD_DATA_MODEL = false;













// TODO: RESUME HERE!

/* 
  Alright, I think that most of this stuff works? I've proofread the 
  functions at both endpoints and have ran them through chatGPT to check
  for glaring mistakes. The approach seems sound, so I think next up is 
  testing.

  Use `TitleMenu.jsx` to make more simple test components for each of
  these functions. 

  Once these work, maybe create these same functions for 
  different types of firestore data? I think that I want to use 
  this same approach for making users (although "createUserEntity" might
  be better as a cloud trigger response).

  After this, hook up the gameRecord creation and retrieval to the client 
  via the game events. 

    - Do I already have existing game event functions that should submit
      records on completion?

  After that, play the game to create records and check to see where the 
  system needs more polish.

  After that, make some basic data analysis functions
*/




















// ========================================================================
// NEW API FUNCTIONS (>7/18, callable cloud functions for firestore access)
// ========================================================================

// new helper functions
export function validateGameRecord(gameRecordData) {
  for (const necessaryKey in gameRecordNecessaryKeys) {
    if (!gameRecordData[necessaryKey]) {
      console.error(`validateGameRecord: gameRecord is missing '${necessaryKey}', aborting.`);
      return false;
    }
  }

  console.log("validateGameRecord: gameRecord is valid!");
  return true;
}

// ensures submitted user object has a userId. Returns the userId if it
// does, and null if it does not.
export function checkIfUserExistsAndGetUid(user, callerName) {
  if (!user || !user.uid) {
    console.error(`${callerName}: user object supplied does not exist`);
    return null;
  }

  return user.uid;
}

// checks if a necessary parameter exists. Logs an error if it doesn't
// and returns true or false based on whether it exists.
function parameterExists(parameter, paramName, callerName) {
  if (!parameter) {
    console.error(`${callerName}: parameter '${paramName}' must be provided.`);
    return false;
  }

  return true;
}

// checks if the response from a callable was successful via the
// presence/state of the response.data.success boolean.
function checkIfResponseWasSuccessful(response, callerName) {
  const { success } = response.data;

  if (success) {
    console.log(`${callerName}: cloud function call successful.`);
    return true;
  }

  const { error } = response.data;

  if (error) {
    console.error(`${callerName}: error calling cloud function:`, error);
  }
  else {
    console.error(`${callerName}: error calling cloud function.`)
  }

  return false;
}

// TODO: Test this function
// takes in a user object (UserContext.user) and the gameRecord data
// as a js object, validates presence of required keys, and creates
// a new document in firestore
export async function createGameRecord(user, gameRecordData) {

  // const testCallable = getCallable('createGameRecord');
  const testCallable = httpsCallable(functions, 'createGameRecord');
  testCallable({data: "test data"});
  return;


  //TODO: Should this add the one-off record to the local gameRecords in context here?
  
  
  
  const userId = checkIfUserExistsAndGetUid(user);
  
  if (!gameRecordData) {
    console.error("createGameRecord: gameRecordData does not exist, aborting.");
    return;
  }
  
  if (typeof gameRecordData !== 'object') {
    console.error("createGameRecord: gameRecordData is not an object, aborting.");
    return;
  }

  // use this as the alias for the callable cloud function
  const callable = getCallable('createGameRecord');

  
  // TODO: Does this record need anything more attached to it?
  gameRecordData['userId'] = userId;
  gameRecordData['lastPlayed'] = Timestamp.now();
  
  // TODO: Enable this
  if (CHECK_GAME_RECORD_DATA_MODEL) {
    if (!validateGameRecord(gameRecordData)) {
      return;
    }
  }
  
  console.log("createGameRecord: invoking callable cloud function, passing in:", gameRecordData);

  const response = await callable(gameRecordData);
  
  console.log(`createGameRecord: callable finished, data returned is:`, response);
  
  return response;
}

export async function getUserGameRecords(user, returnFullResponse = false) {
  /*
    should call httpCallable(functions, "getUserGameRecords")
    */

   // not sure if passing the user object as an arg is the best way
  // to verify - is there a simpler approach?
  if (!checkIfUserExistsAndGetUid(user)) return;

  const callable = getCallable("getUserGameRecords");

  try {
    const response = await callable({data: "test parameter for cf"});
    if (checkIfResponseWasSuccessful(response, "getUserGameRecords")) {
      console.log("getUserGameRecords: received response:", response);
      if (returnFullResponse) return response;

      // return convertFirestoreResponseToDataArray(response);
      return getDataFromApiResponse(response);
    }
  } 
  catch (error) {
    console.error("getUserGameRecords: error getting game records:", error);
  }

  return null;
}

export async function completeGameRecord(user, gameRecordId) {


  //TODO: Should this modify the record in the local gameRecords in context here?
  
  
  
  
  /*
    takes an existing gameRecord that lives at /users/{userId}/gameRecords/{gameRecordId}
    and modifies it so that gameRecord.completed === true
  */
  if (!checkIfUserExistsAndGetUid(user)) return;
  if (!parameterExists(gameRecordId, "gameRecordId", "completeGameRecord")) return;

  const callable = getCallable("updateGameRecord");
  
  // only submit { completed: true }, as only changed fields update
  const data = {
    gameRecord: { completed: true },
    gameRecordId,
  };
  
  try {
    const response = await callable(data);
    if (checkIfResponseWasSuccessful(response)) return response;
  }
  catch (error) {
    console.error("completeGameRecord: error completing game record:", error);
  }

  return null;
}

export async function deleteGameRecord(user, gameRecordId) {


  //TODO: Should this remove the record in the local gameRecords in context here?




  /*
  takes an existing gameRecord at /users/{userId}/gameRecords/{gameRecordId}
  and deletes it.
  
  DOES NOT delete the top-level /gameRecords/{gameRecordId} entry.
  
  - Should this only delete in-progress records? I think so - there isn't a good use case
  for users deleting their previous records.
  */
 
 if (!checkIfUserExistsAndGetUid(user)) return;
  if (!parameterExists(gameRecordId, "gameRecordId", "deleteGameRecord")) return;

  const callable = getCallable("deleteGameRecord");
  const data = { gameRecordId };

  try { 
    const response = await callable(data);
    checkIfResponseWasSuccessful(response);
  }
  catch (error) {
    console.error('deleteGameRecord: error deleting record:', error)
  }
}

// ===========================================================
// OLD API FUNCTIONS (Pre 7/18, client-level firestore access)
// ===========================================================

// user-related api functions
export async function createUserEntity(newUser, id) {
  console.log("createUserEntity: received newUser: ", newUser);
  // assuming the user is valid, as the registration process would have caught an error

  // create a batched write
  const batch = writeBatch(db);

  // create user entity document
  try {
    const docRef = doc(usersCollectionRef, id);
    const userCreatedTimestamp = Timestamp.now();
    newUser["createdTimestamp"] = userCreatedTimestamp;
    newUser["updatedTimestamp"] = userCreatedTimestamp;

    // add user entity doc to the batch 
    batch.set(docRef, newUser);

    // create gameRecords subcolleciton with empty "achievements" and "puzzles" docs
    const gameRecordsCollectionRef = collection(docRef, "gameRecords");
    const achievementsDocRef = doc(gameRecordsCollectionRef, "achievements");
    const puzzlesDocRef = doc(gameRecordsCollectionRef, "puzzles");

    // add the empty docs to the batch
    batch.set(achievementsDocRef, {});
    batch.set(puzzlesDocRef, {});

    // commit the batched write
    await batch.commit();
    // return response;
    return true;
  }
  catch (error) {
    return error;
  }
}

export async function getUserProfile(userId) {
  console.log("getUserProfile: received userId: ", userId);

  try {
    // get ref to user doc and snapshot of doc
    console.log("getUserProfile: starting try block...");
    const userProfileDocRef = doc(usersCollectionRef, userId);
    const userProfileSnapshot = await getDoc(userProfileDocRef);

    // console.log("getUserProfile: got userProfileSnapshot: ", userProfileSnapshot);
    
    if (!userProfileSnapshot.exists()) {
      // bad scenario, no user profile exists
      console.error("getUserProfile: user profile does not exist");
      return null;
    }
    
    // profile exists, get the data
    const userProfileData = userProfileSnapshot.data();

    console.log("getUserProfile: got userProfileData: ", userProfileData);

    // TODO: Move this operation out of here and into its own function
    // get the gameRecords subcollection
    const gameRecordsCollectionRef = collection(userProfileDocRef, "gameRecords");
    const gameRecordsSnapshot = await getDocs(gameRecordsCollectionRef);

    // console.log("getUserProfile: got gameRecordsSnapshot:", gameRecordsSnapshot);

    // get the data from each doc in the gameRecords subcollection
    const gameRecords = {};
    gameRecordsSnapshot.forEach((doc) => gameRecords[doc.id] = doc.data());

    console.log("getUserProfile: got gameRecords data:", gameRecords);

    // add the gameRecords subcollection data to the userProfileData
    userProfileData.gameRecords = gameRecords;

    console.log("getUserProfile: fetched user profile with gameRecords:", userProfileData);

    return userProfileData;
  }
  catch (error) {
    console.error("getUserProfile: error: ", error);
    return null;
  }
}

// achievement-related api functions
export async function getAchievements() {
  console.log("api: getAchievements: fetching achievements");

  try {
    const achievementsSnapshot = await getDocs(achievementsCollectionRef);
    const achievements = [];

    achievementsSnapshot.forEach((achievementDoc) => {
      if (achievementDoc.exists()) {
        const achievement = achievementDoc.data();
        // append id
        achievement.id = achievementDoc.id;

        // add to achievement array
        achievements.push(achievement);
      }
    });

    return achievements;
  }
  catch (error) {
    console.error("api: getAchievements: error:", error);
  }
};

// puzzle-related api functions

// TODO: Adapt this to use the cached puzzle data whenever you implement that
export async function getPuzzles() {
  console.log("api: getPuzzles: fetching puzzles");
  
  // TODO: When do you sort and organize these into their puzzle sets?

  try {
    const puzzlesSnapshot = await getDocs(puzzlesCollectionRef);    
    const puzzles = [];
    
    puzzlesSnapshot.forEach((puzzleDoc) => {
      if (puzzleDoc.exists()) {
        const puzzle = puzzleDoc.data();
        // append id
        puzzle.id = puzzleDoc.id;
        
        // add to puzzle array
        !puzzle.hideMe && puzzles.push(puzzle);
      }
    });

    return puzzles;
  }
  catch (error) {
    console.error("api: getPuzzles: error:", error);
  }
}

// TODO: Probably adapt this into a "getAllOfficialPuzzles" function
export async function getUserPuzzles(
  authorId, 
  setUserPuzzles,
  orderByField = "updatedTimestamp",
  // orderByField = "createdTimestamp",
){
  console.log("api: getUserPuzzles: received authorId:", authorId);

  // build query to get all puzzles for the given authorId
  const userPuzzlesQuery = query(
    puzzlesCollectionRef, 
    // TODO: Modify this for all official puzzles
    where("authorId", "==", authorId),
    orderBy(orderByField, "desc"),
  );
  
  // execute the query
  const userPuzzlesSnapshot = await getDocs(userPuzzlesQuery);

  // get the documents from the snapshot
  const userPuzzles = userPuzzlesSnapshot.docs.map((puzzleDocRef) => {
    const puzzleDocData = puzzleDocRef.data();
    puzzleDocData.id = puzzleDocRef.id;
    return puzzleDocData;
  });

  console.log("api: getUserPuzzles: received the following user puzzles: ", userPuzzles);

  // store the puzzles 
  setUserPuzzles(userPuzzles);
}


export async function getPuzzleGridForPuzzle(puzzleData) {
  console.log("api: getPuzzleGridForPuzzle: received puzzleData: ", puzzleData);

  // pull out puzzleId
  const puzzleId = puzzleData.id;

  if (!puzzleId) {
    console.error("api: getPuzzleGridForPuzzle: puzzleData has no id attached to it.");
    return;
  }

  let loadedGrid = [];

  const puzzleDocRef = doc(puzzlesCollectionRef, puzzleData.id);
  const gridCollectionRef = collection(puzzleDocRef, "grid");
  const gridDocRef = doc(gridCollectionRef, gridSubcollectionDocId);

  // const gridSnapshot = await gridDocRef.get();
  const gridSnapshot = await getDoc(gridDocRef);

  if (gridSnapshot.exists()) {
    const gridData = gridSnapshot.data();

    if (gridData.gridString) {
      const parsedGrid = JSON.parse(gridData.gridString);
      loadedGrid = parsedGrid;
    }
  }

  return loadedGrid;
}

