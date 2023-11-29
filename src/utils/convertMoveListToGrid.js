/**
 * Converts a move list (stored as an array of string) into a game's grid (an array of numbers).
 * Each string is in the format of `pixelCount-index`, where index is the squareStatusCodeIndex 
 * (see squareUtils.js) for the action performed on that square. Requires the dimensions of the
 * puzzle passed in as well.
 * 
 * Goes from ["1-1", "3-1", "6-1", "2-2"] to [0, 1, 2, 1, 0, 0, 1]
 * @param {string[]} moveList moves stored in order as `pixelCount-squareStatusCodeIndex` 
 * @param {number|string} height height of the puzzle
 * @param {number|string} width width of the puzzle 
 * @param {boolean} onlyFills whether to only convert fill moves (for use with grid icons)
 * @returns {number[]}
 */
export default function convertMoveListToGrid(moveList, height, width, onlyFills = false) {
  if (!moveList || !height || !width) {
    console.error(`convertMoveListToGrid: missing required input data.`);
    return;
  }

  const gridSize = width * height;

  const grid = Array(gridSize).fill(0);

  // each string is `pixelCount-squareStatusCodeIndex`.

  // fills are "1" - if onlyFills, ignore everything but 1s.
  moveList.forEach((moveString) => {
    // hyphen delimiter is hardcoded here, maybe make a constant somewhere?
    const [ pixelCountString, fillIndexString ] = moveString.split("-");
    const pixelCount = parseInt(pixelCountString);
    const fillIndex = parseInt(fillIndexString);

    if (fillIndex === 0) return;

    if (pixelCount >= gridSize || pixelCount < 0) {
      console.error(`convertMoveListToGrid: ${pixelCount} is outside of bounds of grid; size is ${gridSize}`);
      return;
    }

    if ((onlyFills && fillIndex === 1) || !onlyFills) {
      grid[pixelCount] = fillIndex;
    }
  });

  return grid;
}