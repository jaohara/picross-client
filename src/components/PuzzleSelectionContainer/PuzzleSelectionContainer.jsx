import React, {
  useContext,
  useEffect,
} from 'react';

import "./PuzzleSelectionContainer.scss";

import {
  TbPuzzle,
  TbPuzzleFilled,
  TbQuestionMark,
} from "react-icons/tb";

import {
  LARGE_ICON_SIZE
} from "../../constants";

import { UserContext } from '../../contexts/UserContext';
import { GameContext } from '../../contexts/GameContext';

import PuzzleIcon from '../PuzzleIcon/PuzzleIcon';

import convertMillisToMinutesAndSeconds from "../../utils/convertMillisToMinutesAndSeconds";

/*
  This is used within PuzzleGroupMenu (NOT PuzzleGroupContainer) to drill down
  into a specific puzzle in a PuzzleGroup.
*/
const PuzzleSelectionContainer = ({
  completedPuzzleIds,
  // TODO: Do I want this as a prop, or can I use useNavigate here directly?
  navigate = () => console.log("PuzzleSelectionContainer didn't receive navigate"),
  puzzles,
}) => {
  const {
    getCompletedPuzzleTime,
  } = useContext(UserContext);

  const {
    selectPuzzle,
    selectPuzzleAndStartFromMenu,
  } = useContext(GameContext);
  
  const checkIfPuzzleIsComplete = (puzzle) => completedPuzzleIds.includes(puzzle.id);

  const handlePuzzleSelectionClick = (puzzle) => {
    console.log("handlePuzzleSelectionClick fired");
    // select puzzle
    // selectPuzzle(puzzle);
    // // navigate to pause screen
    // navigate("/pause");
    // // Is there some "start game" step that I'm missing here?
    // // toggle menu
    // toggleMenu();

    selectPuzzleAndStartFromMenu(puzzle, navigate);
  }

  const puzzleSelectionList = puzzles.map((puzzle, index) => (
    <PuzzleSelection
      bestTime={getCompletedPuzzleTime(puzzle)}
      handlePuzzleSelectionClick={handlePuzzleSelectionClick}
      isCompleted={checkIfPuzzleIsComplete(puzzle)}
      key={`puzzle-selection-${index}`}
      puzzle={puzzle}
      selectPuzzle={selectPuzzle}
    />
  ));

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
  handlePuzzleSelectionClick = () => console.log("PuzzleSelection: handlePuzzleSelectionClick fired"),
  isCompleted = false,
  puzzle,
}) => {
  // TODO: Replace with generated puzzle icon
  const puzzleIcon = isCompleted ? 
    (<TbPuzzleFilled size={LARGE_ICON_SIZE} />) : 
    (<TbQuestionMark size={LARGE_ICON_SIZE} />);

  const puzzleSelectionClassNames = `
    puzzle-selection
    ${isCompleted ? "" : "in"}complete
  `;

  // bestTime will be null if incomplete
  const timeString = bestTime ? convertMillisToMinutesAndSeconds(bestTime) : "--:--";

  const gridSizeString = puzzle ? `${puzzle.height} x ${puzzle.width}` : "TEST x TEST";

  useEffect(() => {
    console.log("PuzzleSelection: puzzle is:", puzzle);
  }, []);

  return (
    <div 
      className={puzzleSelectionClassNames}
      onClick={() => handlePuzzleSelectionClick(puzzle)}
    >
      <h1 className="puzzle-selection-name">
        {/* TODO: Maybe hide name if puzzle isn't finished? */}
        {puzzle.name}
      </h1>

      <div className="puzzle-selection-body">

        {/* 
          TODO: Use PuzzleIcon Component here
        */}
        <div className="puzzle-selection-icon">
          {/* {puzzleIcon} */}
          <PuzzleIcon
            puzzleData={puzzle}
            revealed={isCompleted}
          />
        </div>

        <div className="puzzle-selection-info">
          <PuzzleSelectionInfoItem
            infoKey={"Grid Size:"}
            infoValue={gridSizeString}
          />

          <PuzzleSelectionInfoItem
            infoKey={"Best Time:"}
            infoValue={timeString}
          />

          {/* TODO: Add puzzle moves when a gameRecord is saved */}
          {/* <PuzzleSelectionInfoItem
            infoKey={"Moves Taken:"}
            infoValue={timeString}
          /> */}
        </div>
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