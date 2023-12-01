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
  deleteGameRecord,
  getUserProfile,
  updateGameRecord,
} from "../firebase/api";

import callbackIsValid from "../utils/callbackIsValid";
import convertMoveListToGrid from "../utils/convertMoveListToGrid";

const UserContext = createContext(undefined);

const UserContextProvider = ({ children }) => {
  // TODO: make "completedGameRecords" and "completedPuzzleIds" state mutations use sets
  //   to ensure no dupes -> watch for shallow comparison with completedGameRecords
  const [ completedPuzzleIds, setCompletedPuzzleIds ] = useState([]);
  const [ completedGameRecords, setCompletedGameRecords ] = useState([]);
  // the users's gameRecords
  // TODO: rename all client references to "puzzleRecords" etc. to "gameRecords"
  const [ puzzleRecords, setPuzzleRecords ] = useState();
  // TODO: Same set considerations as "completedGameRecords" etc. above
  // stores incomplete gameRecordIds
  const [ inProgressPuzzleIds, setInProgressPuzzleIds ] = useState([]);
  // stores incomplete gameRecords
  const [ inProgressGameRecords, setInProgressGameRecords ] = useState([]);
  // user's auth object 
  const [ user, setUser ] = useState();
  // the useProfile created by createUserEntity. contains user profile data
  //  and gameRecords as a field
  const [ userProfile, setUserProfile ] = useState();
  const [ userProfileIsLoading, setUserProfileIsLoading ] = useState(false);

  // hook for updating puzzleRecords on userProfile change
  useEffect(() => {
    if (!userProfile) return;

    setUserProfileIsLoading(false);

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

  // hook for updating completedGameRecords/inProgressGameRecords when puzzleRecords changes
  useEffect(() => {
    if (!puzzleRecords) {
      return;
    }

    console.log("UserContext: puzzleRecords callback: puzzleRecords are:", puzzleRecords);
    
    const newPuzzleRecordIds = Object.keys(puzzleRecords);
    const newCompletedPuzzles = [];
    const newIncompletePuzzles = [];
    const newCompletedPuzzleIds = [];
    const newinProgressPuzzleIds = [];
    
    newPuzzleRecordIds.forEach((newPuzzleRecordId) => {
      const newPuzzleRecord = puzzleRecords[newPuzzleRecordId];
        newPuzzleRecord.id = newPuzzleRecordId;
        const { puzzleId } = newPuzzleRecord;
      
      if (newPuzzleRecord.completed) {
        // console.log(`UserContext: puzzleRecords callback: ${newPuzzleRecord.id} is complete`);
        newCompletedPuzzleIds.push(puzzleId);
        newCompletedPuzzles.push(newPuzzleRecord);
      }
      else {
        newinProgressPuzzleIds.push(puzzleId);
        newIncompletePuzzles.push(newPuzzleRecord);
      }
    });

    setCompletedPuzzleIds([...new Set(newCompletedPuzzleIds)]);
    setCompletedGameRecords(newCompletedPuzzles);
    setInProgressPuzzleIds([...new Set(newinProgressPuzzleIds)]);
    setInProgressGameRecords(newIncompletePuzzles);
  }, [puzzleRecords]);

  // hook for adding an auth listener on initial page load to fetch the userProfile and assign it
  //  to a state value when a user logs in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user ? user : null);

      if (user) {
        setUserProfileIsLoading(true);

        const fetchData = async () => {
          const userProfileData = await getUserProfile(user.uid);
          console.log(`UserContext: data getUserProfile result is:`, userProfileData);
          userProfileData.id = user.uid;
          setUserProfile(userProfileData);
        };

        fetchData();
      }
    });

    return unsubscribe;
  }, []);

  // TODO: reduce code reuse from [action]GameRecord functions, have a better error message
  //  after bailing out in the first if block?

  // adds a puzzleRecord to the puzzleRecords state value
  const addGameRecord = (newGameRecord) => {
    if (!userProfile || !puzzleRecords) {
      return;
    }

    // console.log("UserContext: addGameRecord called with:", newGameRecord);
    // console.log("UserContext: current puzzleRecords is: ", puzzleRecords);
    // console.log("UserContext: current userProfile is:", userProfile);

    const newGameRecordPuzzleId = newGameRecord.puzzleId;

    setPuzzleRecords((currentPuzzleRecords) => {
      const newPuzzleRecords = { ...currentPuzzleRecords };
      newPuzzleRecords[newGameRecordPuzzleId] = newGameRecord;
      return newPuzzleRecords;
    });

    // save the puzzle record remotely
    createGameRecord(user, newGameRecord);
  };

  const updateInProgressGameRecord = (updatedGameRecord) => {
    if (!userProfile || !puzzleRecords) {
      return;
    }

    console.log("UserContext: coffee updateInProgressGameRecord called with:", updatedGameRecord);
    console.log("UserContext: coffee current puzzleRecords is: ", puzzleRecords);
    console.log("UserContext: coffee current userProfile is:", userProfile);

    const { id: existingId } = updatedGameRecord;

    // how do we set the puzzle records, omitting the one that this replaces?
    setPuzzleRecords((currentPuzzleRecords) => {
      const newPuzzleRecords = {};

      // find the existing record and update its value
      Object.entries(currentPuzzleRecords).forEach(([recordId, record]) => {
        if (recordId === existingId) {
          newPuzzleRecords[existingId] = updatedGameRecord;
          return;
        }

        newPuzzleRecords[recordId] = record;
      });

      return newPuzzleRecords;
    });

    // update the remote game records 
    updateGameRecord(user, updatedGameRecord);
  };

  const deleteInProgressGameRecord = (targetGameRecord) => {
    console.log("UserContext: deleteInProgressGameRecord: received gameRecord:", targetGameRecord);
    if (!userProfile || !puzzleRecords) {
      return;
    }

    const { id: targetGameRecordId } = targetGameRecord;

    setPuzzleRecords((currentPuzzleRecords) => {
      const newPuzzleRecords = {};

      // only allow records that aren't the existing record
      Object.entries(currentPuzzleRecords).forEach(([recordId, record]) => {
        if (recordId === targetGameRecordId) {
          return;
        }

        newPuzzleRecords[recordId] = record;
      });

      return newPuzzleRecords;
    });

    // TODO: Implement
    // delete the remote game record 
    deleteGameRecord(user, targetGameRecordId);
  };

  // TODO: REMOVE DEBUG CODE
  useEffect(() => console.log("UserContext: New completedGameRecords:", completedGameRecords), [completedGameRecords]);
  useEffect(() => console.log("UserContext: New completedPuzzleIds:", completedPuzzleIds), [completedPuzzleIds]);
  useEffect(() => console.log("UserContext: New inProgressPuzzleIds:", inProgressPuzzleIds), [completedPuzzleIds]);
  
  // TODO: REMOVE DEBUG CODE
  useEffect(() => {
    console.log("UserContext: New inProgressGameRecords:", inProgressGameRecords);
  } , [completedGameRecords]);

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

  const getInProgressGameRecordsFromPuzzleData = (puzzleData) => {
    if (!inProgressGameRecords) return null;

    const { id } = puzzleData;

    const filteredRecords = inProgressGameRecords.filter((gameRecord) => gameRecord.puzzleId === id);

    if (filteredRecords.length === 0) {
      console.log(`getInProgressGameRecordsFromPuzzleData: puzzle not found`);
      return null;
    }

    return filteredRecords;
  }

  const getFirstInProgressGameRecordFromPuzzleData = (puzzleData) => {
    const filteredRecords = getInProgressGameRecordsFromPuzzleData(puzzleData);

    if (!filteredRecords || !Array.isArray(filteredRecords)) return null;

    return filteredRecords[0];
  }

  // returns the puzzle grid for an incomplete puzzle, or null if a puzzle with the given id
  //  isn't in progress.
  const getIncompletePuzzleGridFromPuzzleData = (puzzleData, onlyFills = false) => {
    // const signature = "UserContext: getIncompletePuzzleGridFromPuzzleId:"
    const { height, width } = puzzleData;

    // this approach always looks for the first gameRecord - there should probably only 
    //  be one in progress at a given time

    const inProgressRecord = getFirstInProgressGameRecordFromPuzzleData(puzzleData);

    const { moveList } = inProgressRecord;

    const grid = convertMoveListToGrid(moveList, height, width, onlyFills);

    // console.log(`${signature} grid result:`, grid);
    return grid;
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
      .then((userCredentials) => {
        console.log("register: success, userCredentials are:", userCredentials);
        userResult = userCredentials.user;
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

  return (
    <UserContext.Provider
      value={{
        addGameRecord,
        completedPuzzleIds,
        completedGameRecords,
        deleteInProgressGameRecord,
        getFirstInProgressGameRecordFromPuzzleData,
        getIncompletePuzzleGridFromPuzzleData,
        getInProgressGameRecordsFromPuzzleData,
        getCompletedPuzzleTime,
        inProgressPuzzleIds,
        inProgressGameRecords,
        login,
        logout,
        puzzleRecords,
        register,
        updateInProgressGameRecord,
        user,
        userProfile,
        userProfileIsLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
};

export { UserContext, UserContextProvider };
