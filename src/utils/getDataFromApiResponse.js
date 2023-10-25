// function to pull the nested data out of a response from api.js
export default function getDataFromApiResponse (response) {
  // assumes the response is successful
  return response.data.data;
}