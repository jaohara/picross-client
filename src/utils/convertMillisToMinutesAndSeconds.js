export default function convertMillisToMinutesAndSeconds (
  duration,
  noDecimals = false,
) {
  let minutes = Math.floor(duration / 60000);
  let seconds = Math.floor((duration % 60000) / 1000);
  
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  let timeString = `${minutes}:${seconds}`;
  
  if (!noDecimals) {
    const remainderMillis = duration % 1000;
    timeString += `.${remainderMillis}`;
  }

  return timeString;
}