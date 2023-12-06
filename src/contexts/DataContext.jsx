import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth } from "../firebase/firebase";

import {
  getPuzzleReports,
  getPuzzles,
} from "../firebase/api";

const DataContext = createContext(undefined);

const DataContextProvider = ({ children }) => {
  // the set of all possible achievements
  // TODO: Finish pruning this code
  const [ achievements, setAchievements ] = useState([])
  // the set of all available puzzles
  const [ puzzles, setPuzzles ] = useState();
  // the puzzleReports built from complete puzzle data
  const [ puzzleReports, setPuzzleReports ] = useState()
  // whether puzzles are loading
  const [ puzzlesAreLoading, setPuzzlesAreLoading ] = useState(false);
  // whether the puzzleReports are loading
  const [ puzzleReportsAreLoading, setPuzzleReportsAreLoading ] = useState(false);

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

  // useEffect to flip puzzleReports loading value
  useEffect(() => {
    console.log("DataContext: useEffect: puzzleReports have loaded:", puzzleReports);
    setPuzzleReportsAreLoading(false);
  }, [puzzleReports])

  const isPuzzleGroup = (groupName) => {
    if (!puzzlesSortedByGroup) {
      return false;
    }

    return Object.keys(puzzlesSortedByGroup).includes(groupName);
  };

  useEffect(() => {
    console.log("DataContext: in initial load useEffect");

    const fetchPuzzleData = async () => {
      // fetch puzzles
      try {
        setPuzzlesAreLoading(true);
        const puzzlesResult = await getPuzzles();
        console.log("DataContext: useEffect: fetchPuzzleData: got puzzles:", puzzlesResult);
        setPuzzles(puzzlesResult);
      }
      catch (error) {
        console.error("DataContext: useEffect: fetchPuzzleData: error getting puzzles:", error);
      }
    };

    const fetchPuzzleReportData = async () => {
      try {
        setPuzzleReportsAreLoading(true);
        const puzzleReportsResult = await getPuzzleReports();
        console.log("DataContext: useEffect: fetchPuzzleReportData: got puzzleReports:", 
          puzzleReportsResult);
        setPuzzleReports(puzzleReportsResult);
      }
      catch (error) {
        console.error("DataContext: useEffect: fetchPuzzleReportData: error getting reports:", error);
      }
    };

    fetchPuzzleData();
    fetchPuzzleReportData();

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
        puzzleReports,
        puzzles,
        puzzleReportsAreLoading,
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
