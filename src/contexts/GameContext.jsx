import React, {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";

import convertMoveListToGrid from "../utils/convertMoveListToGrid";
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

import { MINIMUM_MOVE_TIME } from "../constants";


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
  const lastMoveTimeStampRef = useRef(null);
  // number of toggleSquare "fill" and "empty-fill" actions that have been performed
  //  - Remember - "x-fill" and "x-empty" actions don't count as moves
  const moveCountRef = useRef(0);
  // list of moves as an array of strings describing actions
  const moveListRef = useRef([]);
  // id of a gameRecord that was used to resume a game
  const resumedGameRecordIdRef = useRef(null);
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


  /**
   * Called internally to reset and start a new game timer. Offset can be provided if resuming
   * an in progress game to add the existing time to the game clock.
   * @param {number} millisOffset optional offset to start the timer 
   */
  const startGameTimer = (millisOffset = 0) => {
    clearStopTime();
    setStartTime(Date.now() - millisOffset);
  };

  const stopGameTimer = () => setStopTime(Date.now());

  const clearGameTimer = () => {
    clearStartTime();
    clearStopTime();
  }
  
  const resetMoveCount = () => moveCountRef.current = 0;
  const setMoveCount = (newCount) => moveCountRef.current = newCount; 
  const resetResumedGameRecordId = () => resumedGameRecordIdRef.current = null;
  const setResumedGameRecordId = (newId) => resumedGameRecordIdRef.current = newId;
  
  const incrementMoveCount = (newStatusIndex) => {
    // "newStatusIndex"  is the 
    if (newStatusIndex <= 1) {
      moveCountRef.current = moveCountRef.current + 1;
    }
  };

  const getLastMove = () => {
    if (!moveListRef.current || !Array.isArray(moveListRef.current) || moveListRef.current.length <= 0) {
      return null;
    }

    return moveListRef.current[moveListRef.current.length - 1];
  };

  // assumes pixelCount and newStatusIndex are valid
  const addMoveToList = (pixelCount, newStatusIndex, oldStatusIndex, timeSinceLastMove) => {
    moveListRef.current.push(`${pixelCount}-${newStatusIndex}-${timeSinceLastMove}`);

    // ignore any x-fills (newStatusIndex of 2)
    if (newStatusIndex === 2) {
      return;
    }

    // ignore any x-empties (2 to 0)
    if (oldStatusIndex === 2 && newStatusIndex === 2) {
      return;
    }

    // The logic above is because we don't want marking or removing "x"s to count towards
    //  the overall move count. 

    // we only have fills and fill-empties now, so increment the move count
    incrementMoveCount(newStatusIndex);
  }

  const setMoveList = (newMoveList) => moveListRef.current = newMoveList;
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
    resetResumedGameRecordId();
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
      console.error("GameContext: resetPuzzleGrid: error with currentPuzzle, couldn't reset grid.");
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
  //  receiving - dependant on codes in squareUtils
  // const togglePuzzleGridSquare = (pixelCount, clickAction) => {
  const togglePuzzleGridSquare = (pixelCountStr, clickAction) => {
    const pixelCount = parseInt(pixelCountStr);

    if (!currentPuzzleGrid || pixelCount > currentPuzzleGrid.length || puzzleIsSolved){
      return;
    }
    
    // TODO: Remove logs
    setCurrentPuzzleGrid(currentGrid => {
      const newGrid = [...currentGrid];
      const oldStatusIndex = getSquareStatusCodeFromStatusIndex(newGrid[pixelCount]);
      const newStatusIndex = getNewSquareStatusAsIndex(clickAction, oldStatusIndex);
      newGrid[pixelCount] = newStatusIndex;
      const timeSinceLastMove = getTimeSinceLastMoveInMillis();
      
      // console.log(`togglePuzzleGridSquare firing on ${pixelCount} with clickAction = ${clickAction}, time since last move is ${timeSinceLastMove}ms`);

      // check if last move is the same
      const lastMove = getLastMove();

      // console.log("togglePuzzleGridSquare: lastMove is:", lastMove);

      // ensure dupe moves aren't logged in moveList
      if (lastMove) {
        const [ lastMovePixelCountString, lastMoveStatusIndexString ] = lastMove.split("-");
        const lastMovePixelCount = parseInt(lastMovePixelCountString);
        const lastMoveStatusIndex = parseInt(lastMoveStatusIndexString);
        const isSameSquare = lastMovePixelCount === pixelCount;
        const isSameMove = isSameSquare && lastMoveStatusIndex === newStatusIndex;

        // TODO: remove debug object
        // const debugObj = {
        //   lastMovePixelCount,
        //   lastMoveStatusIndex,
        //   isSameSquare,
        //   isSameMove,
        //   pixelCount,
        //   newStatusIndex,
        // };
        
        // if (lastMovePixelCount === pixelCount && lastMoveStatusIndex === newStatusIndex) {
        if (!isSameMove) {
          // return currentGrid;
          // console.log(`togglePuzzleGridSquare: not a dupe, recording`);
          // console.log(`togglePuzzleGridSquare: debugObj:`, debugObj);
          addMoveToList(pixelCount, newStatusIndex, oldStatusIndex, timeSinceLastMove);
          // console.log(`togglePuzzleGridSquare: new moveList:`, moveListRef.current);
        }
      }
      else {
        // for the case of it being the first move
        addMoveToList(pixelCount, newStatusIndex, oldStatusIndex, timeSinceLastMove);
      }

      return newGrid;
    });
  };

  const getTimeSinceLastMoveInMillis = () => {
    // if (!lastMoveTimeStampRef.current) {
    //   return Date.now() - startTime;
    // }

    const newLastMoveTime = Date.now();
    const oldLastMoveTime = !lastMoveTimeStampRef.current 
      ? startTime 
      : lastMoveTimeStampRef.current;

    const timeSinceLastMove = newLastMoveTime - oldLastMoveTime;
    lastMoveTimeStampRef.current = newLastMoveTime;
    
    return timeSinceLastMove;
  }

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

  // Used internally to select which puzzle is active
  const selectPuzzle = (puzzle) => {
    // TODO: Maybe include more logic here to determine when we can load? 
    // - probably not if a game is running, or something similar?
    console.log("GameContext: setCurrentPuzzle: setting to:", puzzle);
    setCurrentPuzzle(puzzle);
  };

  /**
   * Given puzzle data and a navigation function, sets up the state values in the context 
   * to create a game using the data, and navigates the user to the game board.
   * @param {*} puzzle the puzzle data (from DataContext) for the new game
   * @param {*} navigate navigation function returned from useNavigate (React Router)
   * @returns boolean whether the game was successfully started
   */
  const selectPuzzleAndStart = (puzzle, navigate) => {
    // TODO: make 'navigate' optional, and only call navigate()/toggleMenu() if provided?
    //   - what purpose does this serve? Will this give me more flexibility in using this?

    if (!puzzle || !navigate) {
      console.error("GameContext: selectPuzzleAndStart: invalid parameters");
      return false;
    }

    // This is the sequence of function calls needed to start a new game

    selectPuzzle(puzzle);
    // set the menu "behind the BoardScreen" to the pause menu
    navigate("/pause"); 
    startGameTimer();
    // hide the pause menu
    toggleMenu();
    return true;
  };

  /**
   * Given puzzle data, a game record, and a navigation function, sets up the state values in 
   * the context to resume the game using the data. After doing so, this navigates the user 
   * to the game board.
   * @param {*} puzzle the puzzle data (from DataContext) for the new game
   * @param {*} gameRecord the gameRecord of the in progress game to resume
   * @param {*} navigate navigation function returned from useNavigate (React Router) 
   * @returns boolean whether the game was successfully started
   */
  const selectInProgressPuzzleAndStart = (puzzle, gameRecord, navigate) => {
    if (!puzzle || !gameRecord || !navigate) {
      console.error("GameContext: selectInProgressPuzzleAndStart: invalid parameters");
      return false;
    }

    // presence of currentPuzzle.resumed will cause updating currentPuzzle to not reset grid
    const resumedPuzzle = { ...puzzle, resumed: true };

    console.log("selectInProgressPuzzleAndStart: coffee attemping to resume from this gameRecord:", gameRecord);

    // pull out data to build grid and offset timer
    const { gameTimer: gameTimerOffset, id: gameRecordId, moveCount, moveList } = gameRecord;
    const { height, width } = puzzle;

    // This is the sequence of function calls needed to resume a game

    selectPuzzle(resumedPuzzle);
    // set timer
    // provide millisOffset of current duration to start timer with existing time
    startGameTimer(gameTimerOffset);
    // set grid
    const puzzleGrid = convertMoveListToGrid(moveList, height, width);
    setCurrentPuzzleGrid(puzzleGrid);
    // store the ref to the gameRecord the game was loaded from
    setResumedGameRecordId(gameRecordId);
    // assign moveList and moveCount values from gameRecord data
    setMoveCount(moveCount);
    setMoveList(moveList);
    // navigate to pause menu over the game board
    navigate("/pause");
    // hide the pause menu
    toggleMenu();
    return true;
  };

  const navigateToPuzzleGroup = (navigate) => {
    setCurrentPuzzleGroup((previousPuzzleGroup) => ({ 
      ...previousPuzzleGroup, 
      hasNavigated: true,
    }));

    navigate("/puzzle-group");
  };

  useEffect(() => {
    // sets up game grid when a puzzle is selected
    if (currentPuzzle && !currentPuzzle.resumed) {
      resetPuzzleGrid();
    }
  }, [currentPuzzle]);

  // called internally on currentPuzzleGrid change 
  /**
   * Schedules the update of rowAndColumnSums via a timeout as to not update too quickly
   * with rapid moves. To be called internally on currentPuzzleGrid change. Returns a 
   * cleanup function for the useEffect hook to destroy the timeout. 
   * @returns {function} the cleanup function for the useEffect hook
   */
  function updateRowAndColumnSums() {
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
    });
  }

  // called internally to check if the puzzle is solved. returns a boolean
  function checkIfPuzzleIsSolved() {
    if (!currentPuzzle) return false;

    const DEBUG_LOGGING = false;

    const { 
      name,
      gridHash: solutionHash, 
    } = currentPuzzle;

    DEBUG_LOGGING && console.log("GameContext: currentPuzzleGrid:", currentPuzzleGrid);

    // convert x's (2) on grid to empty (0)
    const convertedPuzzleGrid = currentPuzzleGrid.map((cell) => cell === 2 ? 0 : cell);
    const currentGridHash = hashPuzzleGrid(convertedPuzzleGrid, name);

    DEBUG_LOGGING &&console.log(`GameContext: currentGridHash, solutionHash: ${currentGridHash}, ${solutionHash}`);

    if (currentGridHash === solutionHash) {
      setPuzzleIsSolved(true);
      // TODO: Do I still need to consider this? Does this issue still exist?
      // from other implementation - stop the timer?
      // stopGameTimer();
      return true;
    }

    return false;
  }

  // effect to check if puzzle is solved
  useEffect(() => {
    console.log("GameContext: updated currentPuzzleGrid:", currentPuzzleGrid);
    const cleanup = updateRowAndColumnSums();
    checkIfPuzzleIsSolved();
    return cleanup;
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
        moveListRef,
        pauseDuration,
        puzzleIsSolved,
        quitGame,
        resumedGameRecordIdRef,
        rowAndColumnSums,
        selectPuzzleAndStart,
        selectInProgressPuzzleAndStart,
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
