export default function convertFromFirestoreTimestampToDate (timestampObject) {
  if (timestampObject instanceof Date) {
    // we're already a date, ignore
    return timestampObject;
  }

  console.log(`convertFromFirestoreTimeStampToDate: attempting to convert:`, timestampObject);

  // convert seconds to millis
  const result = new Date(timestampObject.seconds * 1000);

  console.log(`convertFromFirestoreTimeStampToDate: result:`, result);

  return result;
}
