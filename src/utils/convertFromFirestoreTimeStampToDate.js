export default function convertFromFirestoreTimestampToDate (timestampObject) {
  // convert seconds to millis
  return new Date(timestampObject.seconds * 1000);
}
