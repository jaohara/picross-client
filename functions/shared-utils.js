/*
  DO NOT EDIT, THIS IS AUTO-GENERATED! 

  The contents of this `./utils.js` file are automatically generated when deploying by 
  combining these comments from `./prepend.js` and necessary utility scripts in 
  ../src/utils.

  Any changes should be made in the appropriate utility module file.
*/

import { createHash } from 'sha256-uint8array';

// creates the puzzle grid hash for checking/storing answers
export default function hashPuzzleGrid(
  puzzleGrid, // flat array of the current grid
  puzzleName, // the name stored at puzzleData.name
) {
  // TODO: I should probably have this grid use the puzzle id rather than the name
  const gridHashInput = `${puzzleName}${puzzleGrid}`;
  const gridHash = createHash().update(gridHashInput).digest("hex");
  return gridHash;
};

// rotates a 2d array 90 degrees clockwise
export default function rotate2dArray(input) {
  // assumes a square, which is fine for our purposes
  const rows = input.length;
  const cols = input[0].length;

  const rotatedArray = [];

  for (let c = cols - 1; c >= 0; c--) {
    const newRow = [];

    for (let r = 0; r < rows; r++) {
      newRow.push(input[r][c]);
    }

    rotatedArray.push(newRow);
  }

  return rotatedArray;
}

// sums up the row numbers in sequence to from a sequence of filled or unfilled 
// squares to the picross sequence for the row and column gutters.
//
// example: 0,1,1,0,1 -> 2 1
export default function sumRowNumbers(row) {
  if (!Array.isArray(row) && row.length <= 0) {
    return null;
  }

  const result = [];
  let currentSum = 0;

  for (let i = 0; i < row.length; i++) {
    // console.log(`row[${i}] = ${row[i]}`)
    if (row[i] !== 0) {
      // console.log(`adding to current sum...`);
      currentSum++;
    }
    else {
      if (currentSum > 0) {
        result.push(currentSum);
        currentSum = 0;
      }
    }
  }

  if (currentSum > 0) {
    result.push(currentSum);
  }

  return result.length > 0 ? result : [0];
};

// splits an array of numbers into a 2d array with the elements of the array appearing
// in the same order in each sub-array. rowWidth defines the length of each array.

/*
  example:

  input: 
    puzzleGrid: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
    rowWidth: 5

  output: 
    [
      [ 1, 2, 3, 4, 5 ],
      [ 6, 7, 8, 9, 10 ],
      [ 11, 12, 13, 14, 15 ],
      [ 16, 17, 18, 19, 20 ],
      [ 21, 22, 23, 24, 25 ]
    ]
*/
export default function splitPuzzleGridByRowWidth (puzzleGrid, rowWidth) {
  const result = [];

  // is this kind of gross?
  let currentRowArray;

  const checkAndAddCurrentRowArray = () => 
    Array.isArray(currentRowArray) && result.push(currentRowArray);

  for (let i = 0; i < puzzleGrid.length; i++) {
    const currentItem = puzzleGrid[i];

    if (i % rowWidth === 0) {
      checkAndAddCurrentRowArray();
      currentRowArray = [];
    }

    currentRowArray.push(currentItem)
  }

  checkAndAddCurrentRowArray();

  return result;
}

