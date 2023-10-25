import getDataFromApiResponse from "./getDataFromApiResponse";
import convertDataFromObjectWithIdKeysToArray from "./convertDataFromObjectWithIdKeysToArray";

/*
  this utility function takes a response object like this:

    {
      data: {
        success: true,
        data: {
          id123: {
            // data fields
          },
          id456: {
            // data fields
          },
          // ...etc.
        }
      }
    }

  and turns it into this:

    [
      {
        id: "id123"
        // data fields
      },
      {
        id: "id456",
        // data fields
      },
      // ...etc.
    ]

  I'm using this for a simple conversion from firestore query responses to a format that 
  is easier to work with in my client.
*/
export default function convertFirestoreResponseToDataArray (response) {
  // // assuming response has already been confirmed to be successful
  //   const responseData = response.data.data;

  //   const result = Object.keys(responseData).map((key) => ({
  //       id: key,
  //       ...responseData[key],
  //     }));

  //   return result;
  return convertDataFromObjectWithIdKeysToArray(getDataFromApiResponse(response));
}