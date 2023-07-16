/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
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
  await gameRecordsRef.doc(gameRecordId).set(gameRecordData);
  logger.info(`setTopLevelGameRecord: successfully created /gameRecord/${gameRecordId}:`, gameRecordData);
}

// should only be called after auth is confirmed
async function setGameRecordForUser(userId, gameRecordData) { 
  logger.info(`setGameRecordForUser: attempting to create new record in /users/${userId}/gameRecords/...`);
}

// create game record
// exports.createGame

// update game record

// delete game record (won't delete global dupe for rankings... or should it?)