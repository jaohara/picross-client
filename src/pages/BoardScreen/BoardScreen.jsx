import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Timestamp } from 'firebase/firestore';

import "./BoardScreen.scss";

import {
  TbClock,
} from "react-icons/tb";

// import and memoize board component
import {default as UnmemoizedBoard} from '../../components/Board/Board';
const Board = React.memo(UnmemoizedBoard);

import Button from '../../components/Button/Button';


import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';

import { 
  BOARD_ICON_SIZE,
} from '../../constants';

import convertMillisToMinutesAndSeconds from '../../utils/convertMillisToMinutesAndSeconds';

const BoardScreen = () => {
  const [ displayTimer, setDisplayTimer ] = useState(0);

  const {
    boardIsReady,
    currentPuzzle,
    currentPuzzleGrid,
    gameIsActive,
    gameIsPaused,
    getCurrentGameTimeInMillis,
    moveCountRef,
    pauseDuration,
    puzzleIsSolved,
    quitGame,
    rowAndColumnSums,
    setGameIsActive,
    startTime,
    togglePuzzleGridSquare,
  } = useContext(GameContext);

  const {
    addPuzzleRecord,
  } = useContext(UserContext);

  const boardScreenClassNames = `
    board-screen screen
    ${gameIsActive ? "active" : ""}
    ${gameIsPaused ? "paused" : ""}
    ${puzzleIsSolved ? "solved" : ""}
  `;

  /*
    TODO: RESUME HERE

    - Make the board screen show whether the game is paused, active, etc
    - show the start time
    - show the puzzleGrid
    - maybe show the game timer?

  */


  // TODO: Temp logic functions for buttons
  const handleCompleteClick = () => {
    console.log("handleCompleteClick fired");
    
    const currentPuzzleId = currentPuzzle.id;

    const puzzleRecord = {
      // This is the "computed poperty name syntax", and it rules
      [currentPuzzleId] : {
        completed: true,
        // not sure I like this logic like this
        gameTimer: getCurrentGameTimeInMillis(Date.now(), pauseDuration),
        id: currentPuzzleId,
        lastPlayed: Timestamp.now(),
        moveCount: moveCountRef.current,
      }
    };

    console.log("BoardScreen: handleCompleteClick: puzzleRecord created:", puzzleRecord);
    addPuzzleRecord(puzzleRecord);
    quitGame();
  };
  
  const handleSaveClick = () => {
    console.log("handleSaveClick fired");

    // TODO: build this - the extra property you need is "puzzleGrid", which is 
    //  the current puzzleGrid string.
  };
  
  const handleQuitClick = () => {
    // console.log("handleQuitClick fired");
    quitGame();
  };

  // calculate the timer logic
  useEffect(() => {
    let requestedFrameId;

    const advanceTimer = () => {
      // console.log("BoardScreen: useEffect: advanceTimer: calling with pauseDuration:", pauseDuration);
      const currentGameTime = getCurrentGameTimeInMillis(Date.now(), pauseDuration);
      setDisplayTimer(currentGameTime);
      requestedFrameId = requestAnimationFrame(advanceTimer);
    };

    requestedFrameId = requestAnimationFrame(advanceTimer);

    return () => {
      cancelAnimationFrame(requestedFrameId);
    };
  }, [startTime, pauseDuration]);

  return ( 
    <div className={boardScreenClassNames}>
      <div className="board-screen-header board-screen-section">
        <div className="game-timer">
          <div className="timer-icon">
            <TbClock size={BOARD_ICON_SIZE}/>
          </div>

          <div className="timer-value">
            {convertMillisToMinutesAndSeconds(displayTimer, true)}
          </div>
        </div>
      </div>

      <div className="board-screen-content-container board-screen-section">
        <div className="board-screen-gameplay-container">
          <div className="board-container">
            {
              boardIsReady && (
                <Board 
                  puzzleData={currentPuzzle}
                  puzzleGrid={currentPuzzleGrid}
                  puzzleIsSolved={puzzleIsSolved}
                  rowAndColumnSums={rowAndColumnSums}
                  togglePuzzleGridSquare={togglePuzzleGridSquare}
                />
              )
            }
          </div>
        </div>   
      </div>

      <div className="board-screen-footer board-screen-section">
        <div className="board-test-controls">
          <h1>Board Test Controls:</h1>
        
          <div className="board-test-controls-wrapper">
            <Button
              onClick={handleCompleteClick}
              iconType='complete'
              >
              Complete Puzzle
            </Button>

            <Button
              onClick={handleSaveClick}
              iconType='save'
            >
              Save Puzzle
            </Button>

            <Button
              onClick={handleQuitClick}
              iconType='quit'
            >
              Quit Puzzle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default BoardScreen;