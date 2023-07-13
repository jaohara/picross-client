export default function findKeyWithLargestArray (input) {
  let largestKey = null;
  let largestLength = 0;

  const inputKeys = Object.keys(input);

  inputKeys.forEach((key) => {
    if (Array.isArray(input[key]) && input[key].length > largestLength) {
      largestKey = key;
      largestLength = input[key].length;
    }
  });

  return largestKey;
};