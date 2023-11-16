// rotates a 2d array 90 degrees counter-clockwise
export default function rotate2dArray(input, clockwise = false) {
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

  if (clockwise) {
    rotatedArray.reverse();
  }

  return rotatedArray;
}

function testRotate2dArray() {
  const input = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  console.log("input: ", input);

  let output = rotate2dArray(input);

  console.log("output: ", output);

  output = rotate2dArray(input, true);

  console.log("clockwise output: ", output);
}

testRotate2dArray();