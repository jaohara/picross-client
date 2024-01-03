/*
  Generated by the Data Analysis Cloud Function, these live at the top-level Firestore collection
  '/puzzleReports'. They are calculated every day at midnight by the scheduled CF call. 
  
  They are built by looking at the previous day's puzzleReport and continuing these running sums:

    - timesSolved (number of complete gameRecords for this puzzle in top-level /gameRecords)
    - totalMoves (sum of moveCounts in all gameRecords for this puzzle)
    - totalTime (sum of gameTimers in all gameRecords for this puzzle)

  Using these, we have a few derived stats:

    - averageMoves
    - averageMoveTime
    - averageSolveTime
    - fastestSolveTime

  In addition, we have some puzzle metadata stored for convenience and versioning:

    - puzzleName
    - puzzleId
    - puzzleGridHash (allows us to know if puzzle has been modified)

  When the Data Analysis CF starts, it will use the timestamp at the top-level of the record
  doc to know the cutoff for gameRecords from the last batch. It will use this to grab all 
  records that were created after that time. If no new records exist, update the timestamp and 
  store the Report as-is for the next day.

  If the CF has new records, it will parse them and add their data to the cumulative sums. After
  this, the derived stats will be calculated, and the new PuzzleReport is stored in Firestore.

  NOTE: to store these, you probably want to create a doc id like so:

    const timestampId = new Date().toISOString(); // Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
 */

const PuzzleReportExample = {
  // maps id of a puzzle to its current data analysis report
  "0eT8EiWI1iLVBNfq6coB" : {
    "averageMoves": 50, // totalMoves / timesSolved
    // is this useful at all? time per move?
    "averageMoveTime": 1135.78, // totalTime / totalMoves
    "averageSolveTime": 56789, // totalTime / timesSolved
    "fastestSolveTime": 12345,
    // pulled from puzzle.gridHash, allows us to know if the puzzle structure changed 
    "puzzleGridHash": "a94f1837dc7e3d3c0f880fc353419cea5be0d781f4a1f53c1cb203ec0c969713",
    "puzzleId": "0eT8EiWI1iLVBNfq6coB",
    "puzzleMinimumMoves": 37,
    "puzzleName": "Pill",
    // how long it took to make this record, in ms
    "reportGenerationTime": 12345,
    // this kind of counts as "gameRecordTotal" - maybe use this name instead? 
    "timesSolved": 123, // sum
    "totalMoves": 6150, // sum
    "totalTime": 6985047, // sum
  },
  //...
  // after all puzzle reports, we have this key assigned to the result of Timestamp.now() called
  //  at the start of the CF. Used to know the start time of the records to search for tomorrow
  "timestamp": {
    // I will be a timestamp
  }, // result of Firestore's Timestamp.now() on start
  // total time it took to generate the report, in ms
  "totalReportGenerationTime": 1234567,
  "totalReports": 12,
};

export default PuzzleReportExample;