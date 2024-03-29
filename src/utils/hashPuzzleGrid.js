import { createHash } from 'sha256-uint8array';

/*
  Cloud Functions uses CommonJS rather than ES6 modules.

  Make sure to mirror any changes here in ./hashPuzzleGridBackend.js. This is the one
  that is used in the backend shared-utils.js file. 
  
  It's not a perfect solution, but it's better than overengineering one around this one case.
*/

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
