import React, {
  createContext,
  useEffect,
  useState,
} from "react";

// import auth functions
import { auth } from "../firebase/firebase";

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// import necessary api functions
import { 
  createGameRecord,
  createUserEntity,
  getUserProfile,
} from "../firebase/api";

import callbackIsValid from "../utils/callbackIsValid";

const UserContext = createContext(undefined);

const UserContextProvider = ({ children }) => {

  // TODO: make "completedGameRecords" and "completedPuzzleIds" state mutations use sets
  //   to ensure no dupes -> watch for shallow comparison with completedGameRecords
  const [ completedPuzzleIds, setCompletedPuzzleIds ] = useState([]);
  const [ completedGameRecords, setCompletedGameRecords ] = useState([]);
  // the users's gameRecords
  // TODO: rename all client references to "puzzleRecords" etc. to "gameRecords"
  const [ puzzleRecords, setPuzzleRecords ] = useState();
  // user's auth object 
  const [ user, setUser ] = useState();
  // the useProfile created by createUserEntity. contains user profile data
  //  and gameRecords as a field
  const [ userProfile, setUserProfile ] = useState();

  // hook for updating completedGameRecords on userProfile change
  useEffect(() => {
    if (!userProfile) return;

    const { gameRecords } = userProfile;

    // console.log("UserContext: useEffect: updating puzzleRecords on userProfile change.");
    // setPuzzleRecords({...userProfile.gameRecords.puzzles});
    const filteredGameRecords = {};

    const gameRecordIds = Object.keys(gameRecords);
    console.log("UserContext: keys (gameRecordIds) for new gameRecords are:", gameRecordIds);

    // TODO: Remove this wonky way of filtering out "puzzles" and "achievements" after 
    //  firebase/api:getUserProfile is rewritten
    gameRecordIds.forEach((gameRecordId) => {
      if (gameRecordId === "puzzles" || gameRecordId === "achievements") return;

      filteredGameRecords[gameRecordId] = gameRecords[gameRecordId];
    });

    console.log("UserContext: New filteredGameRecords:", filteredGameRecords);

    setPuzzleRecords({...filteredGameRecords});
  }, [userProfile]);

  // hook for updating completedGameRecords when puzzleRecords changes
  useEffect(() => {
    if (!puzzleRecords) {
      return;
    }

    console.log("UserContext: puzzleRecords callback: puzzleRecords are:", puzzleRecords);
    
    const newPuzzleRecordIds = Object.keys(puzzleRecords);
    const newCompletedPuzzles = [];
    const newCompletedPuzzleIds = [];
    
    newPuzzleRecordIds.forEach((newPuzzleRecordId) => {
      const newPuzzleRecord = puzzleRecords[newPuzzleRecordId];
      
      if (newPuzzleRecord.completed) {
        // console.log(`UserContext: puzzleRecords callback: ${newPuzzleRecord.id} is complete`);
        newPuzzleRecord.id = newPuzzleRecordId;
        const { puzzleId } = newPuzzleRecord;
        newCompletedPuzzleIds.push(puzzleId);
        newCompletedPuzzles.push(newPuzzleRecord);
      }
    });

    setCompletedPuzzleIds([...new Set(newCompletedPuzzleIds)]);
    setCompletedGameRecords(newCompletedPuzzles);
  }, [puzzleRecords]);

  // adds a puzzleRecord to the puzzleRecords state value
  const addPuzzleRecord = (newGameRecord) => {
    if (!userProfile || !puzzleRecords) {
      return;
    }

    console.log("UserContext: addPuzzleRecord called with:", newGameRecord);
    console.log("UserContext: current puzzleRecords is: ", puzzleRecords);
    console.log("UserContext: current userProfile is:", userProfile);

    const newGameRecordPuzzleId = newGameRecord.puzzleId;

    setPuzzleRecords((currentPuzzleRecords) => {
      // TODO: Remove after you confirm this works
      // const newPuzzleRecords = { ...currentPuzzleRecords, puzzleRecord: newGameRecord };
      const newPuzzleRecords = { ...currentPuzzleRecords };
      newPuzzleRecords[newGameRecordPuzzleId] = newGameRecord;
      // console.log("UserContext: addPuzzleRecord: updating puzzleRecords to:", newPuzzleRecords);
      return newPuzzleRecords;
    });

    // save the puzzle record remotely
    // TODO: implement some approach to batch submit these after a certain interval? Will I ever
    //  need to throttle writing these?
    // TODO: How should I handle this promise chain? Should this function be async?
    // TODO: What if I have an app-level logging overlay that communicates these messages?
    createGameRecord(user, newGameRecord);
    
    // TODO: How do I handle dupes here? Should I use a set?
    // Add to the completed puzzle/completed puzzle Id set 
    // if (puzzleRecord.completed) {
    //   setCompletedPuzzles([...completedGameRecords, puzzleRecord]);
    //   setCompletedPuzzleIds([...new Set([...completedPuzzleIds, puzzleRecord.puzzleId])]);
    // }
  };

  useEffect(() => console.log("UserContext: New completedGameRecords:", completedGameRecords), [completedGameRecords]);
  useEffect(() => console.log("UserContext: New completedPuzzleIds:", completedPuzzleIds), [completedPuzzleIds]);

  // gets the best recorded time in millis for a completed puzzle, or null if it hasn't
  //  been completed.
  const getCompletedPuzzleTime = (puzzle) => {
    // console.log("UserContext: getCompletedPuzzleTime: looking for puzzle:", puzzle);
    // console.log("UserContext: getCompletedPuzzleTime: searching in:", completedGameRecords);

    const filteredPuzzles = completedGameRecords.filter((gameRecord) => 
      gameRecord.puzzleId === puzzle.id
    );
    
    if (filteredPuzzles.length === 0) {
      console.log("UserContext: getCompletedPuzzleTime: puzzle not found");
      return null;
    }
    
    console.log("UserContext: getCompletedPuzzleTime: found puzzles:", filteredPuzzles);
    
    return filteredPuzzles[0].gameTimer;
  };

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
          userProfileData.id = user.uid;
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
        addPuzzleRecord,
        completedPuzzleIds,
        completedGameRecords,
        getCompletedPuzzleTime,
        login,
        logout,
        puzzleRecords,
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
