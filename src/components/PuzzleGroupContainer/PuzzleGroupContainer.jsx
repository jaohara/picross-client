import React, {
  useEffect,
} from 'react';

import "./PuzzleGroupContainer.scss";

import {
  TbPuzzle,
  TbPuzzleFilled,
  TbQuestionMark,
} from "react-icons/tb";

import {
  LARGE_ICON_SIZE
} from "../../constants";

const PuzzleGroupContainer = ({ 
  completedPuzzleIds,
  handlePuzzleGroupClick = () => console.log("handlePuzzleGroupClick fired"),
  highlightCompletedPuzzles = true,
  puzzlesSortedByGroup,
}) => {
  const puzzleGroups = Object.keys(puzzlesSortedByGroup);

  const checkIfPuzzleIsComplete = (puzzle) => {
    if (!highlightCompletedPuzzles) {
      return false;
    }

    return completedPuzzleIds.includes(puzzle.id);
  };

  const puzzleGroupList = puzzleGroups.map((puzzleGroup, index) => (
    <PuzzleGroup
      groupData={puzzlesSortedByGroup[puzzleGroup]}
      groupName={puzzleGroup}
      handlePuzzleGroupClick={handlePuzzleGroupClick}
      key={`puzzle-group-${index}`}
      checkIfPuzzleIsComplete={checkIfPuzzleIsComplete}
    />
  ))

  useEffect(() => {
    console.log("PuzzleGroupContainer: useEffect: completedPuzzleIds are:", completedPuzzleIds); 
  }, []);

  return ( 
    <div className="puzzle-group-container">
      {puzzleGroupList}
    </div>
  );
}

const PuzzleGroup = ({ 
  checkIfPuzzleIsComplete,
  groupData, 
  groupName,
  handlePuzzleGroupClick, 
}) => {
  const puzzleGroupColors = new Set();

  const puzzleGroupIcons = groupData.map((puzzle, index) => {
    puzzleGroupColors.add(...puzzle.colors);

    return (
      <PuzzleGroupIcon
        key={`puzzle-group-icon-${index}`}
        puzzle={puzzle}
        isCompleted={checkIfPuzzleIsComplete(puzzle)}
      />);
  });

  // TODO: Indicate when all puzzles in group are complete

  return (
    <div 
      className="puzzle-group"
      onClick={(e) => handlePuzzleGroupClick(e, groupName, [...puzzleGroupColors])}
    >
      <h1 className="puzzle-group-name">
        {groupName}
      </h1>

      <div className="puzzle-group-body">
        {puzzleGroupIcons}
      </div>
    </div>
  )
}

const PuzzleGroupIcon = ({ 
  puzzle,
  isCompleted,
}) => {
  // TODO: Use whatever utility function we use to recreate solved puzzles as icons here

  useEffect(() => {
    // console.log("PuzzleGroupIcon: useEffect: puzzle is:", puzzle);
  }, []);

  const puzzleGroupIconClassNames = `
    puzzle-group-icon 
    ${isCompleted ? "" : "in"}complete
  `;

  const puzzleIcon = isCompleted ?
    // (<TbPuzzleFilled size={LARGE_ICON_SIZE}/>) :
    (<TbPuzzle size={LARGE_ICON_SIZE}/>) :
    // (<TbPuzzle size={LARGE_ICON_SIZE}/>); 
    (<TbQuestionMark size={LARGE_ICON_SIZE}/>); 

  return (
    <div className={puzzleGroupIconClassNames}>
      {puzzleIcon}
    </div>
  )
}
 
export default PuzzleGroupContainer;