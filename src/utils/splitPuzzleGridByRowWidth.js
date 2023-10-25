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
