import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  const timerAnimationIdRef = useRef(null);

  const {
    boardIsReady,
    currentPuzzle,
    currentPuzzleGrid,
    gameIsActive,
    gameIsPaused,
    getCurrentGameTimeInMillis,
    moveCountRef,
    moveListRef,
    pauseDuration,
    puzzleIsSolved,
    quitGame,
    resumedGameRecordIdRef,
    rowAndColumnSums,
    startTime,
    togglePuzzleGridSquare,
  } = useContext(GameContext);

  const {
    addGameRecord,
    deleteInProgressGameRecord,
    updateInProgressGameRecord,
  } = useContext(UserContext);

  const boardScreenClassNames = `
    board-screen screen
    ${gameIsActive ? "active" : ""}
    ${gameIsPaused ? "paused" : ""}
    ${puzzleIsSolved ? "solved" : ""}
  `;

  // creates a gameRecord object for storage in Firestore from the supplied game data
  function buildGameRecordFromGameData (
    puzzleId,
    puzzleName,
    moveCountRef,
    moveListRef,
    pauseDuration,
    completed = true,
    existingGameRecordId = null,
  ) {
    const MARK_DEV_RECORDS = true;

    const puzzleRecord = {
      completed,
      gameTimer: getCurrentGameTimeInMillis(Date.now(), pauseDuration),
      puzzleId,
      puzzleName,
      // lastPlayed is added in api.createGameRecord
      moveCount: moveCountRef.current,
      moveList: moveListRef.current,
    };

    if (existingGameRecordId) {
      puzzleRecord["id"] = existingGameRecordId;
    }

    // TODO: remove after testing
    // marks logs made during development for easy access/removal
    if (MARK_DEV_RECORDS) {
      puzzleRecord["devRecord"] = true;
    }

    return puzzleRecord;
  }

  // used for shared code between handleCompleteClick (saving complete gameRecord at end of puzzle)
  //  and handleSaveClick (save incomplete gameRecord to resume later)
  // const handleGameRecordClick = (recordIsComplete = true) => {
    const handleGameRecordClick = (recordIsComplete = true) => {
    const { id, name } = currentPuzzle;
    
    // console.log("BoardScreen: handleCompleteClick: puzzleRecord created:", puzzleRecord);
    if (recordIsComplete) {
      const gameRecord = 
        buildGameRecordFromGameData(id, name, moveCountRef, moveListRef, pauseDuration);

      addGameRecord(gameRecord);
    }
    else if (resumedGameRecordIdRef.current !== null) {
      const existingGameRecordId = resumedGameRecordIdRef.current;

      const gameRecord = buildGameRecordFromGameData(
        id, name, moveCountRef, moveListRef, pauseDuration, false, existingGameRecordId
      );

      console.log("handleGameRecordClick: coffee testing resumed game save, existingGameRecordId is:", existingGameRecordId);
      console.log("handleGameRecordClick: coffee testing resumed game save, gameRecord built is:", gameRecord);

      updateInProgressGameRecord(gameRecord)
    }

    quitGame();
  };

  // TODO: Remove code after testing
  // const handleCompleteClick = () => {
  //   const { id } = currentPuzzle;

  //   const puzzleRecord = 
  //     buildGameRecordFromGameData(id, moveCountRef, moveListRef, pauseDuration);

  //   // console.log("BoardScreen: handleCompleteClick: puzzleRecord created:", puzzleRecord);
  //   addGameRecord(puzzleRecord);
  //   quitGame();
  // };
  const handleCompleteClick = () => handleGameRecordClick(true);
  const handleQuitClick = () => quitGame();
  const handleSaveClick = () => handleGameRecordClick(false);

  // calculate the timer logic
  useEffect(() => {
    const advanceTimer = () => {
      // console.log("BoardScreen: useEffect: advanceTimer: calling with pauseDuration:", pauseDuration);
      const currentGameTime = getCurrentGameTimeInMillis(Date.now(), pauseDuration);
      setDisplayTimer(currentGameTime);
      timerAnimationIdRef.current = requestAnimationFrame(advanceTimer);
    };

    timerAnimationIdRef.current = requestAnimationFrame(advanceTimer);

    return () => {
      cancelAnimationFrame(timerAnimationIdRef.current);
    };
  }, [startTime, pauseDuration]);

  // logic to stop the timer when puzzle is solved
  useEffect(() => {
    puzzleIsSolved && cancelAnimationFrame(timerAnimationIdRef.current);
  }, [puzzleIsSolved]);

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