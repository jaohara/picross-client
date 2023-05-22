import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// import auth functions
import { auth } from "../firebase/firebase";

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

// import necessary api functions
import { 
  createUserEntity,
  getUserProfile,
} from "../firebase/api";

import callbackIsValid from "../utils/callbackIsValid";

const UserContext = createContext(undefined);

const UserContextProvider = ({ children }) => {
  // TODO: TEMP BEHAVIOR - replace with actual auth object, right now this 
  // is just spoofing whether a user is logged in or not with a bool
  const [ user, setUser ] = useState(false);
  // the useProfile created by createUserEntity. contains user profile data
  //  and gameRecords as a field
  const [ userProfile, setUserProfile ] = useState();

  // TODO: add more derived data here, UPDATING FIRST NULL-ARRAY RETURN STATEMENT
  const [ completedPuzzles, completedPuzzleIds ] = useMemo(() => {
    if (!userProfile) {
      return [ null, null ];
    }

    const puzzleRecords = userProfile.gameRecords.puzzles;
    const puzzleRecordIds = Object.keys(puzzleRecords);

    const completedPuzzles = [];
    const completedPuzzleIds = [];

    puzzleRecordIds.forEach((puzzleRecordId) => {
      const puzzleRecord = puzzleRecords[puzzleRecordId];

      if (puzzleRecord.completed) {
        puzzleRecord.id = puzzleRecordId;
        completedPuzzleIds.push(puzzleRecordId);
        completedPuzzles.push(puzzleRecord);
      }
    });

    return [ completedPuzzles, completedPuzzleIds ];
  }, [userProfile])

  // TODO: the signup function here should call api.createUserEntity,
  //  and the login function should also double check to see if all the required 
  //  subcollections exist when a user is logged (stats, cheevos)
  //
  // Should this be something like api.checkAndCreateUserEntitySubcollections?
  
  const register = (
    email, 
    password, 
    displayName, 
    successCallback = () => {}
  ) => {
    console.log(`UserContext: register called with email: ${email}, displayName: ${displayName}`);
    let userResult = null;

    return createUserWithEmailAndPassword(auth, email, password)
      // .then((userCredentials) => {
      //   console.log("register: success, userCredentials are:", userCredentials);
      //   user = userCredentials.user;
        
      //   // user has been created, create user entity with updated profile
      //   return updateProfile(user, { displayName });
      // })
      .then((userCredentials) => {
        console.log("register: success, userCredentials are:", userCredentials);
        userResult = userCredentials.user;
        // create the user entity in firestore
        // console.log("register: success, displayName added.");
        return createUserEntity({ name: displayName }, userResult.uid);
      })
      .then((userEntityCreationSuccess) => {
        console.log("register: success, user entity was created:", userEntityCreationSuccess);
        callbackIsValid(successCallback) && successCallback()
      })
      .catch((error) => {
        console.error("auth: register: error creating account: ", error);
      });
  };

  function login (
    email, 
    password, 
    successCallback = () => {},
    // TODO: This needs some more thought - what specifically is failing? right now
    //  I'm only using this for one thing, which is an invalid password. it does not
    //  get more specific in the event of an invalid user email
    failureCallback = () => {},
  ) {
    // TODO: Remove debug log
    console.log(`UserContext: login called for email: ${email}`);

    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        // TODO: Remove debug log
        console.log("login: success, userCredentials are:", userCredentials);
        callbackIsValid(successCallback) && successCallback();
      })
      .catch((error) => {
        // TODO: Remove debug log
        console.error("auth: login: error logging in: ", error);
        callbackIsValid(failureCallback) && failureCallback();
      });
  };

  function logout () {
    // TODO: Remove debug log
    console.log("UserContext: logout: calling logout...");

    return signOut(auth)
      .catch((error) => {
        console.error("UserContext: logout: error: ", error);
      })
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user ? user : null);

      // TODO: get user profile
      if (user) {
        const fetchData = async () => {
          const userProfileData = await getUserProfile(user.uid);
          setUserProfile(userProfileData);
        };

        fetchData();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        completedPuzzleIds,
        completedPuzzles,
        login,
        logout,
        register,
        user,
        userProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
};

export { UserContext, UserContextProvider };
