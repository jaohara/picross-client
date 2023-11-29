import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth } from "../firebase/firebase";

import {
  getPuzzles,
} from "../firebase/api";

const DataContext = createContext(undefined);

const DataContextProvider = ({ children }) => {
  // the set of all possible achievements
  // TODO: Finish pruning this code
  const [ achievements, setAchievements ] = useState([])
  // the set of all available puzzles
  const [ puzzles, setPuzzles ] = useState();
  // whether puzzles are loading
  const [ puzzlesAreLoading, setPuzzlesAreLoading ] = useState(false);

  // cached puzzle Group data
  const [ puzzlesSortedByGroup, puzzleGroups ] = useMemo(() => {
    if (!puzzles) {
      return [ null, null ];
    }

    const puzzlesSortedByGroup = {};

    puzzles.forEach((puzzle) => {
      // add puzzle to proper set key
      if (!puzzle.group){
        return;
      }

      const currentGroup = puzzlesSortedByGroup[puzzle.group]

      puzzlesSortedByGroup[puzzle.group] = !currentGroup ? 
        [puzzle] :
        [...currentGroup, puzzle]; 
    });

    const puzzleGroups = Object.keys(puzzlesSortedByGroup);

    console.log("DataContext: computed puzzlesSortedByGroup:", puzzlesSortedByGroup);
    console.log("DataContext: computed puzzleGroups:", puzzleGroups);

    setPuzzlesAreLoading(false);

    return [ puzzlesSortedByGroup, puzzleGroups ];
  }, [puzzles]);

  const isPuzzleGroup = (groupName) => {
    if (!puzzlesSortedByGroup) {
      return false;
    }

    return Object.keys(puzzlesSortedByGroup).includes(groupName);
  }

  useEffect(() => {
    console.log("DataContext: in initial load useEffect");

    const fetchData = async () => {
      // fetch achievements
      // try {
      //   const achievementsResult = await getAchievements();
      //   console.log("DataContext: useEffect: fetchData: got achievements:", achievementsResult);
      //   setAchievements(achievementsResult);
      // }
      // catch (error) {
      //   console.error("DataContext: useEffect: fetchData: error getting achievements:", error);
      // }

      // fetch puzzles
      try {
        setPuzzlesAreLoading(true);
        const puzzlesResult = await getPuzzles();
        console.log("DataContext: useEffect: fetchData: got puzzles:", puzzlesResult);
        setPuzzles(puzzlesResult);
      }
      catch (error) {
        console.error("DataContext: useEffect: fetchData: error getting puzzles:", error);
      }
    };

    fetchData();


    // TODO: What was I intending to do here? Is this leftover
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // a callback that triggers when a user's auth state changes
    });

    return unsubscribe;
  }, []);

  return (
    <DataContext.Provider
      value={{
        achievements,
        isPuzzleGroup,
        puzzles,
        puzzlesAreLoading,
        puzzleGroups,
        puzzlesSortedByGroup,
      }}
    >
      {children}
    </DataContext.Provider>
  )
};

export { DataContext, DataContextProvider };
