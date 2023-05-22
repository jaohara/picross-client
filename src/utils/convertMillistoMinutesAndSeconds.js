export default function convertMillisToMinutesAndSeconds (duration) {
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const remainderMillis = duration % 1000;

  return `${minutes}:${seconds}.${remainderMillis}`;
}