/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// import and init firestore
const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


// Test function to return a count of all game records in the document database
exports.countGameRecords = onRequest(async (req, res) => {
  logger.info("Invoking countGameRecords...");

  // temp variable - remove with check to permanent storage
  const cacheIsValid = false;
  // if cache is valid - serve info from cache
  if (cacheIsValid) {
    res.send("Cache is valid!")
    return;
  }
  
  // if cache is invalid (over ~6hrs since last update)
  try {
    const gameRecords = [];

    const batch = db.batch();
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();

    
    /*
      TODO: logic here is kind of broken, and might need to be reconsidered with the 
      top-level /gameRecords collection.

      Querying all of the documents in the user subcollections is going to cause a LOT of 
      read operations. It's not really feasible to run this multiple times a day - I think we 
      need to gun once or twice a day, max. 

      Anyway, using this top-level collection, we won't need to query the user records at all, 
      which will cut out some reads. We'll also have simpler (non-batched) read logic for getting
      everything from /gameRecords.

      Maybe return to work here?
          
    */
    usersSnapshot.forEach((userDoc) => {
      // get a reference to the user's "gameRecords" collection
      const gameRecordsRef = userDoc.ref.collection('gameRecords');

      // create a read op for the collection
      const gameRecordsQuery = gameRecordsRef.get();
      batch.set(gameRecordsQuery);
    });

    // execute the batched read operation
    const results = await batch.commit();

    // iterate over the batched results and add to the collection
    results.forEach((gameRecordsSnapshot) => 
      gameRecordsSnapshot.forEach((gameRecordDoc) => 
        gameRecords.push(gameRecordDoc.data()))
    );

    // send the gameRecords as a response
    res.status(200).json(gameRecords);
  } 
  catch (error) {
    logger.error("Error querying gameRecords:", error);
  }
});


// TODO: WORK ON THIS MORE
// function to create a dupe, top-level gameRecord on creation of a completed user gameRecord
exports.createGameRecord = functions.firestore
  .document('users/{userId}/gameRecords/{gameRecordId}')
  .onCreate(async (snapshot, context) => {
    try {
      const { gameRecordId } = context.params;
      
      const gameRecordData = snapshot.data();

      // bail out if record isn't complete
      if (!gameRecordData.completed) { 
        logger.info("GameRecord isn't complete, not duplicating.")
        return;
      }

      // TODO: filter unnecessary fields here
      delete gameRecordData.userId;

      // create a dupe entry in the top-level /gameRecords coll
      const gameRecordsRef = db.collection('gameRecords');
      await gameRecordsRef.doc(gameRecordId).set(gameRecordData);
    }
    catch (error) {
      logger.error("Error duplicating gameRecord:", error);
    }
  });
