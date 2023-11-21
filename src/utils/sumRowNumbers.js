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
    // if (row[i] !== 0) { 
    if (row[i] === 1) {
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
