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
