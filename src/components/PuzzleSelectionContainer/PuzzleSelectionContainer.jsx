import React, {
  useEffect,
} from 'react';

import "./PuzzleSelectionContainer.scss";

/*
  This is the detailed list of puzzles that you select one to play 
  from. It appears on the `PuzzleGroupMenu` subpage.

  TODO: Should I rename this to PuzzleGroupContainer, and rename
   PuzzleGroupContainer to PuzzleListContainer to reflect the menu
   pages that they are used on?
*/
const PuzzleSelectionContainer = ({
  completedPuzzleIds,
  puzzles,
}) => {
  const puzzleSelectionList = puzzles.map((puzzle, index) => (
    <PuzzleSelection
      key={`puzzle-selection-${index}`}
      puzzle={puzzle}
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
  puzzle,
}) => {
  return (
    <div className="puzzle-selection">
      <h1 className="puzzle-selection-name">
        {/* TODO: Maybe hide name if puzzle isn't finished? */}
        {puzzle.name}
      </h1>

      <div className="puzzle-selection-body">
        <div className="puzzle-selection-icon">
          {/* TODO: use generated icon here */}
        </div>
      </div>
    </div>
  )
}
 
export default PuzzleSelectionContainer;