import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// TODO: import necessary api functions
import {
  getAchievements, getPuzzles
} from "../firebase/api";

const DataContext = createContext(undefined);

const DataContextProvider = ({ children }) => {
  // the set of all possible achievements
  const [ achievements, setAchievements ] = useState([])
  // whether the achievements are loaded
  // const [ achievementsAreLoading, setAchievementsAreLoading ] = useState(false)
  // the set of all available puzzles
  const [ puzzles, setPuzzles ] = useState();

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
      try {
        const achievementsResult = await getAchievements();
        console.log("DataContext: useEffect: fetchData: got achievements:", achievementsResult);
        setAchievements(achievementsResult);
      }
      catch (error) {
        console.error("DataContext: useEffect: fetchData: error getting achievements:", error);
      }

      // fetch puzzles
      try {
        const puzzlesResult = await getPuzzles();
        console.log("DataContext: useEffect: fetchData: got puzzles:", puzzlesResult);
        setPuzzles(puzzlesResult);
      }
      catch (error) {
        console.error("DataContext: useEffect: fetchData: error getting puzzles:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        achievements,
        isPuzzleGroup,
        puzzles,
        puzzleGroups,
        puzzlesSortedByGroup,
      }}
    >
      {children}
    </DataContext.Provider>
  )
};

export { DataContext, DataContextProvider };
