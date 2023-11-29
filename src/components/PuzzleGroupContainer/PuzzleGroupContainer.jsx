import React, {
  useEffect,
  useState,
} from 'react';

import "./PuzzleGroupContainer.scss";

import {
  TbPuzzle,
  TbPuzzleFilled,
  TbQuestionMark,
} from "react-icons/tb";

import PuzzleIcon from '../PuzzleIcon/PuzzleIcon';

import {
  LARGE_ICON_SIZE
} from "../../constants";

/*
  Naming is a little confusing here - this component is used on PuzzleListMenu
  to drill down into a specific PuzzleGroup.
*/
const PuzzleGroupContainer = ({ 
  completedPuzzleIds,
  handlePuzzleGroupClick = () => console.log("handlePuzzleGroupClick fired"),
  highlightCompletedPuzzles = true,
  inProgressPuzzleIds,
  puzzlesSortedByGroup,
}) => {
  const puzzleGroups = Object.keys(puzzlesSortedByGroup);

  // TODO: Remove older function implementation
  // const checkIfPuzzleIsComplete = (puzzle) => {
  //   if (!highlightCompletedPuzzles) {
  //     return false;
  //   }

  //   const result = completedPuzzleIds.includes(puzzle.id);


  //   // return completedPuzzleIds.includes(puzzle.id);
  //   return result;
  // };

  const checkIfPuzzleIsComplete = (puzzle) => highlightCompletedPuzzles && completedPuzzleIds
    && puzzle.id
    && completedPuzzleIds.includes(puzzle.id);

  const checkIfPuzzleIsInProgress = (puzzle) => inProgressPuzzleIds
    && puzzle.id
    && inProgressPuzzleIds.includes(puzzle.id);

  const checkIfPuzzleGroupIsComplete = (puzzleGroup) => 
    puzzleGroup.every(checkIfPuzzleIsComplete);

  const puzzleGroupList = puzzleGroups.map((puzzleGroup, index) => (
    <PuzzleGroup
      checkIfPuzzleIsComplete={checkIfPuzzleIsComplete}
      checkIfPuzzleIsInProgress={checkIfPuzzleIsInProgress}
      groupData={puzzlesSortedByGroup[puzzleGroup]}
      groupName={puzzleGroup}
      handlePuzzleGroupClick={handlePuzzleGroupClick}
      isCompleted={checkIfPuzzleGroupIsComplete(puzzlesSortedByGroup[puzzleGroup])}
      key={`puzzle-group-${index}`}
    />
  ));

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
  checkIfPuzzleIsInProgress,
  groupData, 
  groupName,
  handlePuzzleGroupClick, 
  isCompleted,
}) => {
  const puzzleGroupColors = new Set();

  const puzzleGroupIcons = groupData.map((puzzle, index) => {
    puzzleGroupColors.add(...puzzle.colors);

    // return (
    //   <PuzzleGroupIcon
    //     key={`puzzle-group-icon-${index}`}
    //     puzzle={puzzle}
    //     isCompleted={checkIfPuzzleIsComplete(puzzle)}
    //   />
    // );

    return (
      <PuzzleIcon
        className="puzzle-group-icon"
        key={`puzzle-group-icon-${index}`}
        puzzleData={puzzle}
        puzzleId={puzzle.id}
        revealed={checkIfPuzzleIsComplete(puzzle)}
        revealedTakesPrecedence
      />
    );
  });

  const puzzleGroupClassNames = `
    puzzle-group
    ${ isCompleted ? "" : "in"}complete
  `;

  return (
    <div 
      className={puzzleGroupClassNames}
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

// TODO: Flesh this out into a PuzzleIcon component that is reused
// here and in PuzzleSelectionContainer
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