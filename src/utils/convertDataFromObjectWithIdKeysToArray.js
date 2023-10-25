export default function convertDataFromObjectWithIdKeysToArray (data) {
  return Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));
}