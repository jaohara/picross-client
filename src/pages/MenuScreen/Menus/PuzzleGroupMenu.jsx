import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import "./Menu.scss";

// remove as necessary
import { DataContext } from '../../../contexts/DataContext';
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';
import PuzzleSelectionContainer from '../../../components/PuzzleSelectionContainer/PuzzleSelectionContainer';

const PuzzleGroupMenu = () => {
  const navigate = useNavigate();

  const {
    completedPuzzleIds,
    inProgressGameRecords,
    inProgressPuzzleIds,
    // getCompletedPuzzleTime,
  } = useContext(UserContext);

  const {
    currentPuzzleGroup,
    // gameIsActive,
    // setGameIsActive,
    // toggleMenu,
  } = useContext(GameContext);

  const {
    isPuzzleGroup,
    puzzlesSortedByGroup,
  } = useContext(DataContext);
  
  const puzzleGroupName = currentPuzzleGroup ? currentPuzzleGroup.name : "null";
  const puzzles = isPuzzleGroup(puzzleGroupName) ? puzzlesSortedByGroup[puzzleGroupName] : null; 

  useEffect(() => {
    // console.log("PuzzleGroupMenu: useEffect: completedPuzzleIds, puzzlesSortedByGroup:", completedPuzzleIds, puzzlesSortedByGroup);
    // console.log("PuzzleGroupMenu: useEffect: puzzles:", puzzles);
  }, []);

  return ( 
    <div className="puzzle-set-menu menu">
      <MenuHeader
        iconType="puzzle-group"
        title={`${puzzleGroupName} Group`}
      />

      <div className="menu-body-container">
        <MenuLinks 
          excludeAll={true}
          showBackButton={true}
        />

        <div className="menu-body">
          <PuzzleSelectionContainer
            // completedPuzzleIds={completedPuzzleIds}
            // inProgressGameRecords={inProgressGameRecords}
            // inProgressPuzzleIds={inProgressPuzzleIds}
            navigate={navigate}
            puzzles={puzzles}
          />
        </div>
      </div>
    </div>
  );
}
 
export default PuzzleGroupMenu;