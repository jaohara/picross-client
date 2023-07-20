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

// TODO: Test this function
export async function createGameRecord(userId, gameRecordData) {
  if (!userId || !gameRecordData) {
    console.error("createGameRecord: both userId and gameRecordData need to be provided, aborting.");
    return;
  }

  if (typeof gameRecordData !== 'object') {
    console.error("createGameRecord: gameRecordData is not an object, aborting.");
    return;
  }

  // use this as the alias for the callable cloud function
  const callable = getCallable('createGameRecord');

  console.log("createGameRecord: invoking callable cloud function");

  // TODO: Does this record need anything more attached to it?
  gameRecordData['userId'] = userId;
  gameRecordData['lastPlayed'] = Timestamp.now();


  // TODO: Make this true after debugging/remove this extra logic
  const CHECK_DATA_MODEL = false;

  if (CHECK_DATA_MODEL) {
    if (!validateGameRecord(gameRecordData)) {
      return;
    }
  }

  const result = await callable(gameRecordData);

  console.log(`createGameRecord: callable finished, data returned is:`, result);
  
  return result;
}

export async function getUserGameRecords(userId) {
  /*
    should call httpCallable(functions, "getUserGameRecords")
  */

  const callable = getCallable("getUserGameRecords");
}

export async function completeGameRecord(userId, gameRecordId) {
  /*
    takes an existing gameRecord that lives at /users/{userId}/gameRecords/{gameRecordId}
    and modifies it so that gameRecord.completed === true
  */
 const callable = getCallable("updateGameRecord");

 // only submit { completed: true }, as only changed fields update
}

export async function deleteGameRecord(userId, gameRecordId) {
  /*
    takes an existing gameRecord at /users/{userId}/gameRecords/{gameRecordId}
    and deletes it.

    DOES NOT delete the top-level /gameRecords/{gameRecordId} entry.

    - Should this only delete in-progress records? I think so - there isn't a good use case
      for users deleting their previous records.
  */

  const callable = httpsCallable(functions, ""
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
    // return result;
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

