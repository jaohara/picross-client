import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

// TODO: import necessary api functions

const GameContext = createContext(undefined);

const GameContextProvider = ({ children }) => {
  // TODO: I think I want to split this into a DataContext and
  // a GameContext eventually to improve performance.
  //
  // - GameContext - holds the current game session ()
  // - DataContext - holds all received game data (puzzles, list of
  //   possible achievements, etc.)

  // overall state
  const [ currentPuzzleGroup, setCurrentPuzzleGroup ] = useState(null);
  const [ currentPuzzle, setCurrentPuzzle ] = useState(null);

  // gameplay-related state
  // whether or not the game menu is active
  const [ menuIsActive, setMenuIsActive ] = useState(true);
  // used to block toggling the menu (when no board is loaded, etc)
  const [ menuScreenToggleLock, setMenuScreenToggleLock ] = useState(false);
  // duration for a pause to measure offset
  const [ pauseDuration, setPauseDuration ] = useState(0);
  // timestamp for when a pause event occurred
  const [ pauseTime, setPauseTime ] = useState(null);
  // timestamp for when the current game instance started
  const [ startTime, setStartTime ] = useState(null);
  
  // whether a game is active - is this necessary? Should I check for the presence of a current puzzle?
  // const [ gameIsActive, setGameIsActive ] = useState(true);
  const gameIsActive = startTime != null;
  // whether or not the game is paused
  const gameIsPaused = pauseTime != null; // single-inequality treats null and undefined as the same

  // TODO: Include some way to save current background colors, as well as 
  // a function to get current background colors from a puzzle
  //
  // Make sure that BackgroundScreen pulls this color to change dynamically
  
  // function to reset the game state when a new puzzle instance is started
  const resetGame = (resetAndRestart = false) => {
    console.log("GameContext: resetGame is called");

    // reset accumulated pause time
    setPauseDuration(0);
    // reset pause timestamp
    setPauseTime(null); 
    // reset game start timestamp
    setStartTime(resetAndRestart ? Date.now() : null); 
    // resetAndRestart && setGameIsActive(true);
  }

  const togglePauseGame = () => {
    // check to see if game is not paused
    if (!gameIsPaused) {
      // game is not paused, save pause timestamp
      setPauseTime(Date.now());
      return;
    }

    // game is paused, end the pause timer
    const currentPauseDuration = Date.now() - pauseTime;
    setPauseDuration((prevPauseDuration) => prevPauseDuration + currentPauseDuration);
    setPauseTime(null);
  }

  const toggleMenu = () => 
    !menuScreenToggleLock && setMenuIsActive((currentMenuState) => !currentMenuState);

  const gameDuration = !gameIsActive ? null : Date.now() - startTime - pauseDuration;

  const clearCurrentPuzzleGroup = () => setCurrentPuzzleGroup(null);

  const clearCurrentPuzzle = () => setCurrentPuzzle(null);

  const selectPuzzleGroup = (groupName, groupColors) => {
    console.log(
      "GameContext: selectPuzzleGroup called with groupName, groupColors:", 
      groupName, 
      groupColors,
    );

    const puzzleGroup = {
      hasNavigated: false,
      name: groupName,
      colors: groupColors,
    };

    setCurrentPuzzleGroup(puzzleGroup);
  };

  const selectPuzzle = (puzzle) => {
    // TODO: Maybe include more logic here to determine when we can load? 
    // - probably not if a game is running, or something similar?
    setCurrentPuzzle(puzzle);
  }

  const navigateToPuzzleGroup = (navigate) => {
    setCurrentPuzzleGroup((previousPuzzleGroup) => ({ 
      ...previousPuzzleGroup, 
      hasNavigated: true,
    }));

    navigate("/puzzle-group")
  };

  return (
    <GameContext.Provider
      value={{
        clearCurrentPuzzle,
        clearCurrentPuzzleGroup,
        currentPuzzleGroup,
        gameDuration,
        gameIsActive,
        gameIsPaused,
        navigateToPuzzleGroup,
        menuIsActive,
        // setGameIsActive,
        selectPuzzle,
        selectPuzzleGroup,
        setMenuIsActive,
        toggleMenu,
        togglePauseGame, 
      }}
    >
      {children}
    </GameContext.Provider>
  )
};

export { GameContext, GameContextProvider };
