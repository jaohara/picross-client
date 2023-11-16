import React, {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";

import hashPuzzleGrid from "../utils/hashPuzzleGrid";
import rotate2dArray from "../utils/rotate2dArray";
import sortHexColors from "../utils/sortHexColors";
import splitPuzzleGridByRowWidth from "../utils/splitPuzzleGridByRowWidth";
import sumRowNumbers from "../utils/sumRowNumbers";

import {
  getNewSquareStatus,
  getNewSquareStatusAsIndex,
  getSquareStatusCodeFromStatusIndex,
  getSquareStatusIndexFromStatusCode,
} from "../utils/squareUtils";


// TODO: import necessary api functions

const GameContext = createContext(undefined);

const GameContextProvider = ({ children }) => {
  // This and DataContext were originally the same, but have since been split:
  //
  // - GameContext - holds the current game session (current loaded puzzle, 
  //   current game board, app menu state, etc.)
  // - DataContext - holds all received static game data (puzzles, list of
  //   possible achievements, etc.)

  
  // gameplay-related state
  // a reference to the current puzzle data
  const [ currentPuzzle, setCurrentPuzzle ] = useState(null);
  // a reference to the current state of the game board
  const [ currentPuzzleGrid, setCurrentPuzzleGrid] = useState(null);
  // a reference to the current puzzle group, used for background styling etc.
  const [ currentPuzzleGroup, setCurrentPuzzleGroup ] = useState(null);
  // whether or not the game menu is active
  const [ menuIsActive, setMenuIsActive ] = useState(true);
  // used to block toggling the menu (when no board is loaded, etc)
  // TODO: Make this a ref?
  // const [ menuScreenToggleLock, setMenuScreenToggleLock ] = useState(false);
  // duration for a pause to measure offset
  const [ pauseDuration, setPauseDuration ] = useState(0);
  // timestamp for when a pause event occurred
  // const [ pauseTime, setPauseTime ] = useState(null);
  const [ pauseTime, setPauseTime ] = useState(0);
  // whether or not the currentPuzzle is solved
  const [ puzzleIsSolved, setPuzzleIsSolved ] = useState(false);
  const [ rowAndColumnSums, setRowAndColumnSums ] = useState(null);
  // timestamp for when the current game instance started
  const [ startTime, setStartTime ] = useState(0);
  // timestamp for when the current game instance ended
  const [ stopTime, setStopTime ] = useState(0);

  // gameplay refs
  // number of toggleSquare actions that have been performed
  const moveCountRef = useRef(0);
  // list of moves as an array of strings describing actions
  const moveListRef = useRef([]);
  // timeout ref for updating the rowAndColumnSums 
  const rowAndColumSumsTimeoutRef = useRef(null);
  
  // whether a game is active - is this necessary? Should I check for the presence of a current puzzle?
  // const [ gameIsActive, setGameIsActive ] = useState(true);
  const gameIsActive = startTime !== 0; // single-inequality treats null and undefined as the same
  const gameHasEnded = stopTime !== 0;
  // whether or not the game is paused
  const gameIsPaused = pauseTime !== 0; 

  const clearStartTime = () => setStartTime(0);
  const clearStopTime = () => setStopTime(0);

  const startGameTimer = () => {
    clearStopTime();
    setStartTime(Date.now());
  };

  const stopGameTimer = () => setStopTime(Date.now());


  const clearGameTimer = () => {
    clearStartTime();
    clearStopTime();
  }
  
  const incrementMoveCount = () => moveCountRef.current = moveCountRef.current + 1;
  const resetMoveCount = () => moveCountRef.current = 0;

  // assumes pixelCount and newStatusIndex are valid
  const addMoveToList = (pixelCount, newStatusIndex) => {
    // I could save a char by making this ${newStatusIndex}${pixelCount} without a delimiter,
    //  assuming status indices will only be one digit
    moveListRef.current.push(`${pixelCount}-${newStatusIndex}`);
    incrementMoveCount();
  }

  const resetMoveList = () => moveListRef.current = [];

  // TODO: Include some way to save current background colors, as well as 
  // a function to get current background colors from a puzzle
  //
  // Make sure that BackgroundScreen pulls this color to change dynamically
  
  // function to reset the game state when a new puzzle instance is started
  const resetGame = (resetAndRestart = false) => {
    console.log("GameContext: resetGame is called");

    // reset puzzle solved state
    setPuzzleIsSolved(false);
    // reset accumulated pause time
    setPauseDuration(0);
    // reset pause timestamp
    setPauseTime(0); 
    resetPuzzleGrid();
    resetRowAndColumnSums();
    resetMoveCount();
    resetMoveList();
    // reset game start timestamp
    resetAndRestart ? startGameTimer() : clearGameTimer();
    // setStartTime(resetAndRestart ? Date.now() : null); 
    // resetAndRestart && setGameIsActive(true);
  };

  const quitGame = (toggleMenuOnQuit = true) => {
    stopGameTimer();
    resetGame();
    clearCurrentPuzzle();
    
    if (toggleMenuOnQuit) {
      toggleMenu();
    }
  };

  // resets the puzzle grid to a cleared state
  const resetPuzzleGrid = () => {
    if (!currentPuzzle || !currentPuzzle.height || !currentPuzzle.width) {
      return;
    }

    const gridSize = currentPuzzle.height * currentPuzzle.width; 
    const grid = Array(gridSize).fill(0);
    setCurrentPuzzleGrid(grid);
  };

  // resets the rowAndColumnSums
  const resetRowAndColumnSums = () => {
    if (!currentPuzzle || !currentPuzzle.height || !currentPuzzle.width) {
      console.error(`resetRowAndColumnSums: error with currentPuzzle`);
      return;
    }

    const { height, width } = currentPuzzle;

    const rowArray = [];
    const colArray = [];

    for (let i = 0; i < height; i++) {
      rowArray.push([]);
    }

    for (let i = 0; i < width; i++) {
      colArray.push([]);
    }

    const newSums = {
      "rows": rowArray,
      "cols": colArray,
    };

    setRowAndColumnSums(newSums);
  };

  function calculateAndSetRowAndColumnSums() {
    // TODO: prune debug code
    const DEBUG_LOGS = true;

    if (!currentPuzzleGrid) return;
    if (!currentPuzzle) return;

    const { width } = currentPuzzle;

    // use rotate2dArray and sumRowNumbers like you do in functions/index:createPuzzle
    const rowPuzzleGrid = splitPuzzleGridByRowWidth(currentPuzzleGrid, width);
    const colPuzzleGrid = rotate2dArray(rowPuzzleGrid, true);

    const rowSumArray = rowPuzzleGrid.map((row) => sumRowNumbers(row));
    const colSumArray = colPuzzleGrid.map((row) => sumRowNumbers(row));

    const newRowAndColumnSums = {
      "rows": rowSumArray,
      "cols": colSumArray,
    };

    if (DEBUG_LOGS) {
      console.log("calculateAndSetRowAndColumnSums: newRowAndColumnSums: ", newRowAndColumnSums);
    }

    setRowAndColumnSums(newRowAndColumnSums);
  };

  // assigns a new value to a square based on the its current state and the action it is 
  //  receiving - dependant on codes in squareConstants
  const togglePuzzleGridSquare = (pixelCount, clickAction) => {
    if (!currentPuzzleGrid || pixelCount > currentPuzzleGrid.length || puzzleIsSolved){
      return;
    }

    console.log(`togglePuzzleGridSquare firing on ${pixelCount} with clickAction = ${clickAction}`);
    
    setCurrentPuzzleGrid(currentGrid => {
      const newGrid = [...currentGrid];
      const currentSquareStatus = getSquareStatusCodeFromStatusIndex(newGrid[pixelCount]);
      // TODO: prune this code
      // const newSquareStatus = getNewSquareStatus(clickAction, currentSquareStatus);
      // const newSquareValue = getSquareStatusIndexFromStatusCode(newSquareStatus);
      const newSquareValue = getNewSquareStatusAsIndex(clickAction, currentSquareStatus);
      newGrid[pixelCount] = newSquareValue;
      addMoveToList(pixelCount, newSquareValue);
      return newGrid;
    });
  };

  // gets current game time, 0 if no game is active
  //  needs to be passed Date.now() as first arg from component, as well as pauseDuration
  //  (obtained in component from this context) 
  const getCurrentGameTimeInMillis = (currentTime, currentPauseDuration) => {
    // if (!gameIsActive) {
    //   // TODO: should this be null?
    //   return 0;
    // }

    /*
      TODO: I'm very unsatisfied with this - I think the values were getting locked
      as what they were on initial render, so that the timer was never updating properly.
      
      The solution I came up with is to pass the currentTime and pause duration in,
      which involves the component that uses the timer calculating the currentTime 
      and pulling the pauseDuration from the context only to pass it back in. It seems
      like the logic for this whole thing is split between here and MenuToggle.
    */

    // const currentPauseTime = gameIsPaused ? pauseTime : 0;

    // console.log("GameContext: getCurrentGameTimeInMillis being called at:", currentTime);
    // console.log("GameContext: currentPauseTime:", currentPauseTime);
    // console.log("GameContext: startTime:", startTime);
    // console.log("GameContext: pauseDuration:", pauseDuration);
    // console.log("GameContext: currentPauseDuration:", currentPauseDuration);

    // return currentTime - (startTime + (currentPauseTime * -1)) - pauseDuration; 
    
    if (gameIsActive) {
      return currentTime - startTime - currentPauseDuration;  
    }
    else if (gameHasEnded) {
      return stopTime - startTime - currentPauseDuration;
    }

    // TODO: bad path as written, not sure about the intent here
    return 0;
  };



  const togglePauseGame = (currentTime) => {
    if (!gameIsActive) {
      return;
    }

    // check to see if game is not paused
    if (!gameIsPaused) {
      // game is not paused, save pause timestamp;
      console.log("GameContext: togglePauseGame: setting pauseTime to:", currentTime);
      // setPauseTime(Date.now());
      setPauseTime(currentTime);
      return;
    }

    // game is paused, end the pause timer
    console.log("GameContext: togglePauseGame: ending pause, old duration is: ", pauseDuration);
    const currentPauseDuration = currentTime - pauseTime;
    console.log("GameContext: togglePauseGame: adding to pauseDuration:", currentPauseDuration);
    setPauseDuration((prevPauseDuration) => prevPauseDuration + currentPauseDuration);
    setPauseTime(0);
  };

  const toggleMenu = () => setMenuIsActive((currentMenuState) => !currentMenuState);
  // !menuScreenToggleLock && setMenuIsActive((currentMenuState) => !currentMenuState);

  const gameDuration = !gameIsActive ? null : Date.now() - startTime - pauseDuration;

  const clearCurrentPuzzleGroup = () => setCurrentPuzzleGroup(null);

  const clearCurrentPuzzle = () => setCurrentPuzzle(null);

  const selectPuzzleGroup = (groupName, groupColors) => {
    console.log(
      "GameContext: selectPuzzleGroup called with groupName, groupColors:", 
      groupName, 
      groupColors,
    );

    const sortedColors = sortHexColors(groupColors);

    console.log("GameContext: selectPuzzleGroup: colors sorted to:", sortedColors);

    const puzzleGroup = {
      hasNavigated: false,
      name: groupName,
      colors: sortedColors,
    };

    setCurrentPuzzleGroup(puzzleGroup);
  };

  const selectPuzzle = (puzzle) => {
    // TODO: Maybe include more logic here to determine when we can load? 
    // - probably not if a game is running, or something similar?
    console.log("GameContext: setCurrentPuzzle: setting to:", puzzle);
    setCurrentPuzzle(puzzle);
  };

  const selectPuzzleAndStartFromMenu = (puzzle, navigate) => {
    //TODO:

    /*
      I want to make a note that this looks to be where I'm defining the sequence
      of events that need to take place to start a game.
    */

    
    selectPuzzle(puzzle);
    // set the menu "behind the BoardScreen" to the pause menu
    navigate("/pause"); 
    startGameTimer();
    // hide the pause menu
    toggleMenu(); 
  }

  const navigateToPuzzleGroup = (navigate) => {
    setCurrentPuzzleGroup((previousPuzzleGroup) => ({ 
      ...previousPuzzleGroup, 
      hasNavigated: true,
    }));

    navigate("/puzzle-group")
  };

  useEffect(() => {
    // callback to set up game grid when a puzzle is selected
    resetPuzzleGrid();
  }, [currentPuzzle]);

  // for recalculating the rowAndColumnSums
  useEffect(() => {
    // clear previously scheduled update if it exists
    if (rowAndColumSumsTimeoutRef.current) {
      clearTimeout(rowAndColumSumsTimeoutRef.current);
    }

    // throttle the recalc by this many ms to prevent the array sum/reduce functions from 
    //  being called too frequently
    const rowAndColRecalculationDelay = 100;

    rowAndColumSumsTimeoutRef.current = setTimeout(() => {
      calculateAndSetRowAndColumnSums();
      rowAndColumSumsTimeoutRef.current = null;
    }, rowAndColRecalculationDelay);

    // cleanup function to clear the timeout
    return (() => {
      if (rowAndColumSumsTimeoutRef.current) {
        clearTimeout(rowAndColumSumsTimeoutRef.current);
      }
    })

  }, [currentPuzzleGrid]);

  const checkIfPuzzleIsSolved = () => {
    const DEBUG_LOGS = false;

    if (!currentPuzzle) return false;

    DEBUG_LOGS && console.log("GameContext: currentPuzzleGrid:", currentPuzzleGrid);

    const { 
      name,
      gridHash: solutionHash, 
    } = currentPuzzle;
    
    // convert x's (2) on grid to empty (0)
    const convertedPuzzleGrid = currentPuzzleGrid.map((cell) => cell === 2 ? 0 : cell);
    const currentGridHash = hashPuzzleGrid(convertedPuzzleGrid, name);

    if (DEBUG_LOGS) {
      console.log(`GameContext: currentGridHash, solutionHash: ${currentGridHash}, ${solutionHash}`);
    }

    if (currentGridHash === solutionHash) {
      setPuzzleIsSolved(true);
      // stop the timer?
      stopGameTimer();
    }
  }


  // check if puzzle is solved
  useEffect(() => {
    if (!currentPuzzle) {
      return;
    }

    const { 
      name,
      gridHash: solutionHash, 
    } = currentPuzzle;

    console.log("GameContext: currentPuzzleGrid:", currentPuzzleGrid);

    // remove x from grid
    const strippedPuzzleGrid = currentPuzzleGrid.map((cell) => cell === 2 ? 0 : cell);

    // const currentGridHash = hashPuzzleGrid(currentPuzzleGrid, name);
    const currentGridHash = hashPuzzleGrid(strippedPuzzleGrid, name);

    console.log(`GameContext: currentGridHash, solutionHash: ${currentGridHash}, ${solutionHash}`);

    if (currentGridHash === solutionHash) {
      setPuzzleIsSolved(true);
    }
  }, [currentPuzzleGrid]);

  const boardIsReady = currentPuzzle && currentPuzzleGrid;

  return (
    <GameContext.Provider
      value={{
        boardIsReady,
        clearCurrentPuzzle,
        clearCurrentPuzzleGroup,
        currentPuzzleGroup,
        currentPuzzle,
        currentPuzzleGrid,
        gameDuration,
        gameIsActive,
        gameIsPaused,
        getCurrentGameTimeInMillis,
        navigateToPuzzleGroup,
        menuIsActive,
        moveCountRef,
        pauseDuration,
        puzzleIsSolved,
        quitGame,
        rowAndColumnSums,
        selectPuzzle,
        selectPuzzleAndStartFromMenu,
        selectPuzzleGroup,
        setMenuIsActive,
        startTime,
        toggleMenu,
        togglePauseGame, 
        togglePuzzleGridSquare,
      }}
    >
      {children}
    </GameContext.Provider>
  )
};

export { GameContext, GameContextProvider };
