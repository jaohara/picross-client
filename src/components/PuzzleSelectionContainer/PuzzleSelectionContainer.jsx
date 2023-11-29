import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import "./PuzzleSelectionContainer.scss";

import { UserContext } from '../../contexts/UserContext';
import { GameContext } from '../../contexts/GameContext';

import PuzzleIcon from '../PuzzleIcon/PuzzleIcon';
import Icon from '../Icon/Icon';

import { EMPTY_PUZZLE_NAME_STRING } from '../../constants';

import convertMillisToMinutesAndSeconds from "../../utils/convertMillisToMinutesAndSeconds";
import Button from '../Button/Button';

/*
  This is used within PuzzleGroupMenu (NOT PuzzleGroupContainer) to drill down
  into a specific puzzle in a PuzzleGroup.
*/
const PuzzleSelectionContainer = ({
  // completedPuzzleIds,
  // inProgressGameRecords,
  // inProgressPuzzleIds,
  // TODO: Do I want this as a prop, or can I use useNavigate here directly?
  navigate = () => console.log("PuzzleSelectionContainer didn't receive navigate"),
  puzzles,
}) => {
  const {
    completedPuzzleIds,
    deleteInProgressGameRecord,
    getCompletedPuzzleTime,
    getFirstInProgressGameRecordFromPuzzleData,
    inProgressGameRecords,
    inProgressPuzzleIds,
    // getIncompletePuzzleGridFromPuzzleData,
  } = useContext(UserContext);

  const {
    selectPuzzleAndStart,
    selectInProgressPuzzleAndStart,
    // import "resumePuzzleFromMenu" or whatever when implemented
  } = useContext(GameContext);
  
  const checkIfPuzzleIsComplete = (puzzle) => 
    completedPuzzleIds && completedPuzzleIds.includes(puzzle.id);

  const checkIfPuzzleIsInProgress = (puzzle) => 
    inProgressPuzzleIds && inProgressPuzzleIds.includes(puzzle.id);

  const getInProgressRecordFromPuzzleData = (puzzle) => {
    if (!puzzle) {
      console.error("PuzzleSelectionContainer: getInProgressRecordFromPuzzleData: invalid data");
      return null;
    }


  }

  const puzzleSelectionList = puzzles.map((puzzle, index) => {
    const inProgress = checkIfPuzzleIsInProgress(puzzle);
    const inProgressGameRecord = getFirstInProgressGameRecordFromPuzzleData(puzzle);

    return (
      <PuzzleSelection
        bestTime={getCompletedPuzzleTime(puzzle)}
        deleteInProgressGameRecord={deleteInProgressGameRecord}
        inProgress={inProgress}
        inProgressGameRecord={inProgressGameRecord}
        isCompleted={checkIfPuzzleIsComplete(puzzle)}
        key={`puzzle-selection-${index}`}
        navigate={navigate}
        puzzle={puzzle}
        selectInProgressPuzzleAndStart={selectInProgressPuzzleAndStart}
        selectPuzzleAndStart={selectPuzzleAndStart}
      />
    );
  });

  useEffect(() => {
    console.log("PuzzleSelectionContainer: useEffect: puzzles are:", puzzles)
  }, []);

  return ( 
    <div className="puzzle-selection-container">
      {puzzleSelectionList}
    </div>
  );
};

const PuzzleSelection = ({
  bestTime,
  deleteInProgressGameRecord = () => {},
  inProgress = false,
  inProgressGameRecord,
  isCompleted = false,
  navigate,
  puzzle,
  selectInProgressPuzzleAndStart,
  selectPuzzleAndStart,
}) => {
  // used to refer to the current "primary button", which is clicked by default when 
  //  clicking anywhere in the PuzzleSelection div
  const primaryButtonRef = useRef(null);

  // used for applying css styles to only the quit button on hover
  const [ isHoveringQuit, setIsHoveringQuit ] = useState(false);

  // handler to trigger a press of the primary button in view 
  const clickPrimaryButton = (e) => {
    console.log("PuzzleSelection: handling click, target is:", e.target);

    // const targetClassName = "puzzle-selection-primary-button";
    // const targetIsNotPrimaryButton = !e.target.classList.contains(targetClassName);
    const targetIsButton = e.target.tagName === "BUTTON";

    if (targetIsButton) {
      console.log("PuzzleSelection: button clicked, firing button click rather than container click");
      return;
    }

    e.preventDefault();
    e.stop

    if (primaryButtonRef.current) primaryButtonRef.current.click();
  };
  
  const handlePlayClick = (e) => {
    console.log("PS: Play button clicked");
    e.stopPropagation();
    selectPuzzleAndStart(puzzle, navigate);
  }
  
  const handleResumeClick = (e) => {
    // TODO: Use "selectInProgressPuzzleAndStart" 
    console.log("PS: Resume button clicked");
    e.stopPropagation();

    if (inProgressGameRecord) {
      selectInProgressPuzzleAndStart(puzzle, inProgressGameRecord, navigate);
    }
  }
  
  const handleAbandonClick = (e) => {
    // TODO: Use "deleteInProgressGameRecord" 
    console.log("PS: Abandon button clicked");
    e.stopPropagation();

    if (inProgressGameRecord) {
      deleteInProgressGameRecord(inProgressGameRecord);
      // important, as this is normally triggered by mouse events, but when the element leaves
      //  the DOM there won't be any way to trigger handleQuitMouseEnter/Leave
      setIsHoveringQuit(false);
    }
  }

  const handleQuitMouseEnter = () => setIsHoveringQuit(true);
  const handleQuitMouseLeave = () => setIsHoveringQuit(false);

  const puzzleSelectionClassNames = `
    puzzle-selection
    ${isCompleted ? "" : "in"}complete
    ${inProgress ? "in-progress" : ""}
  `;

  // bestTime will be null if incomplete
  const timeString = bestTime ? convertMillisToMinutesAndSeconds(bestTime) : "--:--";

  const gridSizeString = puzzle ? `${puzzle.height} x ${puzzle.width}` : "TEST x TEST";

  // useEffect(() => {
  //   console.log("PuzzleSelection: puzzle is:", puzzle);
  // }, []);

  const puzzleName = isCompleted ? puzzle.name : EMPTY_PUZZLE_NAME_STRING;

  const getMetadataIcons = () => {
    const commonProps = {leftMargin: true, rightMargin: false};
    
    return (
      <div className="puzzle-selection-metadata-icons">
        {
          isCompleted ? (
            <Icon
              iconType='complete' 
              label={"Solved!"}
              {...commonProps}
            />
          ) : ("")
        }

        {
          inProgress ? (
            <Icon
              iconType='in-progress'
              label={"In Progress"}
              {...commonProps}
            />
            ) : ("")
          }
      </div>
    );
  };
  
  const getPuzzleControls = () => {
    const primaryButtonClassName = `
      puzzle-selection-primary-button 
      ${isHoveringQuit ? "no-hover-style" : ""}
    `;

    return (
      <div className="puzzle-selection-controls-wrapper">
        { 
          !inProgress ? (
            <Button
              className={primaryButtonClassName}
              iconType="play"
              onClick={handlePlayClick}
              ref={primaryButtonRef}
            >
              Play
            </Button>
          ) :  (
            <>
              <Button
                className={primaryButtonClassName}
                iconType='play'
                onClick={handleResumeClick}
                ref={primaryButtonRef}
              >
                Resume  
              </Button>
              <Button 
                className='delete-unlocked'
                iconType='delete'
                onClick={handleAbandonClick}
                onMouseEnter={handleQuitMouseEnter}
                onMouseLeave={handleQuitMouseLeave}
              >
                Abandon
              </Button>
            </>
          )
        }
      </div>
    );
  };

  return (
    <div 
      className={puzzleSelectionClassNames}
      // onClick={() => handlePuzzleSelectionClick(puzzle)}
      onClick={clickPrimaryButton}
    >

      {/* TODO: Wrap as div.puzzle-selection-metadata */}
      
      <div className="puzzle-selection-metadata">
        <h1 className="puzzle-selection-name">
          {puzzleName}
        </h1>

        {getMetadataIcons()}
      </div>

      <div className="puzzle-selection-body">
        <div className="puzzle-selection-icon">
          <PuzzleIcon
            puzzleId={puzzle.id}
          />
        </div>

        <div className="puzzle-selection-info">
          {/* 
            TODO: Add puzzle info for in progress records:
              - current time
              - current moves
          */}
          <PuzzleSelectionInfoItem
            infoKey={"Grid Size:"}
            infoValue={gridSizeString}
          />

          <PuzzleSelectionInfoItem
            infoKey={"Best Time:"}
            infoValue={timeString}
          />

        </div>

      </div>
      
      <div className="puzzle-selection-controls">
        {getPuzzleControls()}
      </div>
    </div>
  )
}

function PuzzleSelectionInfoItem ({
  infoKey,
  infoValue,
}) {
  return (
    <div className="puzzle-selection-info-item">
      <span className="puzzle-selection-info-key">
        {infoKey}
      </span>

      <span className="puzzle-selection-info-value">
        {infoValue}
      </span>
    </div>
  )
}
 
export default PuzzleSelectionContainer;