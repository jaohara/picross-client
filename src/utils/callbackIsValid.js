//TODO: is this working properly?
export default function callbackIsValid (callback) {
  return callback && typeof callback === "function";
}