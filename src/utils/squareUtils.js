// Board square-related constants and functions
// indices correspond to the int fill value in the puzzleGrid
export const squareStatusCodes = [
  "empty",  // 0
  "fill",   // 1
  "x",      // 2
];

export const maxValidSquareStatusCode = squareStatusCodes.length;

/**
 * gets the status code string from a status index (used to store current state in puzzleGrid)
 * @param {number} index the index to parse into a statusCode 
 * @returns {string|null} the statusCode as a string or null on an invalid index
 */
export const getSquareStatusCodeFromStatusIndex = (index) => {
  if (index >= maxValidSquareStatusCode) {
    console.error(`getSquareStatusFromIndex: index out of bounds.`);
    return null;
  } 

  return squareStatusCodes[index];
}

/**
 * gets the status code index from a status code (used for determining actions and state transitions)
 * @param {string} statusCode a string that exists in squareStatusCodes
 * @returns {number} the index of the statusCode or -1 for an invalid statusCode
 */
export const getSquareStatusIndexFromStatusCode = (statusCode) => {
  const index = squareStatusCodes.indexOf(statusCode);

  if (index === -1) {
    console.error(`getSquareStatusIndexFromStatusCode: invalid status code.`);
  }

  return index;
}

const squareStatusCodeIsValid = (statusCode) => squareStatusCodes.includes(statusCode);

// valid click actions; order does not matter
//   or does it? should these indices correspond to the move list?
export const clickActions = [
  "empty-fill", // 0
  "empty-x",    // 1
  "fill",       // 2
  "x",          // 3
];

const clickActionIsValid = (clickAction) => clickActions.includes(clickAction);


// maps a clickAction type to a given current state to determine what to change the square to
// the current clickAction is the first key and the clicked squareStatus is the second
/*
  imagined usage: setNewSquarevalue(clickStateChanges[clickAction][currentSquare]);
*/
export const clickStateChanges = {   
  "empty-fill": {
    "empty": "empty",
    "fill": "empty",
    "x": "x",
  },
  "empty-x": {
    "empty": "empty",
    "fill": "fill",
    "x": "empty",
  },
  "fill": {
    "empty": "fill",
    "fill": "fill",
    "x": "x",
  },
  "x": {
    "empty": "x",
    "fill": "fill",
    "x": "x",
   },
};

export const getNewSquareStatus = (clickAction, currentSquareStatus) => {
  if (!clickActionIsValid(clickAction)) return null;
  if (!squareStatusCodeIsValid(currentSquareStatus)) return null;

  return clickStateChanges[clickAction][currentSquareStatus];
};

export const getNewSquareStatusAsIndex = (clickAction, currentSquareStatus) => {
  const newStatus = getNewSquareStatus(clickAction, currentSquareStatus);
  return getSquareStatusIndexFromStatusCode(newStatus);
}

// gets the pixelCount that is stored in the id of the DOM element for the square
//    assumes ids are like "board-square-x", where x is pixelCount
// const pixelCount = e.target.id.split("-")[2];
export const getPixelCountFromDOMId = (idString) => idString.split("-")[2]; 