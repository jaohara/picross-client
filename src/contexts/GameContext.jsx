import React, {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";

import hashPuzzleGrid from "../utils/hashPuzzleGrid";
import sortHexColors from "../utils/sortHexColors";


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
  // number of toggleSquare actions that have been performed
  const moveCountRef = useRef(0);
  // used to block toggling the menu (when no board is loaded, etc)
  // const [ menuScreenToggleLock, setMenuScreenToggleLock ] = useState(false);
  // duration for a pause to measure offset
  const [ pauseDuration, setPauseDuration ] = useState(0);
  // timestamp for when a pause event occurred
  // const [ pauseTime, setPauseTime ] = useState(null);
  const [ pauseTime, setPauseTime ] = useState(0);
  // whether or not the currentPuzzle is solved
  const [ puzzleIsSolved, setPuzzleIsSolved ] = useState(false);
  // timestamp for when the current game instance started
  const [ startTime, setStartTime ] = useState(0);
  
  // whether a game is active - is this necessary? Should I check for the presence of a current puzzle?
  // const [ gameIsActive, setGameIsActive ] = useState(true);
  const gameIsActive = startTime !== 0; // single-inequality treats null and undefined as the same
  // whether or not the game is paused
  const gameIsPaused = pauseTime !== 0; 


  const startGameTimer = () => setStartTime(Date.now());
  const stopGameTimer = () => setStartTime(0);
  
  const incrementMoveCount = () => moveCountRef.current = moveCountRef.current + 1;
  const resetMoveCount = () => moveCountRef.current = 0;

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
    // reset puzzle grid
    resetPuzzleGrid();
    // reset move count
    resetMoveCount();
    // reset game start timestamp
    resetAndRestart ? startGameTimer() : stopGameTimer();
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

  // flips the value of the given square, the count being the index in the puzzle grid array
  const togglePuzzleGridSquare = (pixelCount, fillType = "fill") => {
    if (!currentPuzzleGrid || pixelCount > currentPuzzleGrid.length || puzzleIsSolved){
      return;
    }

    console.log(`togglePuzzleGridSquare firing on ${pixelCount} with fillType = ${fillType}`);
    
    setCurrentPuzzleGrid(currentGrid => {
      const newGrid = [...currentGrid];
      const currentFill = newGrid[pixelCount];

      if (fillType === "fill" && currentFill !== 2){
        console.log("We made it, setting a fill to 1");
        newGrid[pixelCount] = currentFill === 1 ? 0 : 1;
      }
      else if (fillType === "x" && currentFill !== 1) {
        console.log("We made it, setting a fill to 2");
        newGrid[pixelCount] = currentFill === 2 ? 0 : 2; 
      }

      return newGrid;
    });
    incrementMoveCount();
  };

  // gets current game time, 0 if no game is active
  //  needs to be passed Date.now() as first arg from component, as well as pauseDuration
  //  (obtained in component from this context) 
  const getCurrentGameTimeInMillis = (currentTime, currentPauseDuration) => {
    if (!gameIsActive) {
      // TODO: should this be null?
      return 0;
    }

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
    return currentTime - startTime - currentPauseDuration;  
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
    navigate("/pause");
    startGameTimer();
    toggleMenu()
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
