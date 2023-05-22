import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { DataContext } from '../../../contexts/DataContext';
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import Button from '../../../components/Button/Button';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';
import PuzzleSelectionContainer from '../../../components/PuzzleSelectionContainer/PuzzleSelectionContainer';

const PuzzleGroupMenu = () => {
  const {
    completedPuzzleIds,
  } = useContext(UserContext);

  const {
    currentPuzzleGroup,
    gameIsActive,
    setGameIsActive,
    toggleMenu,
  } = useContext(GameContext);

  const {
    isPuzzleGroup,
    puzzlesSortedByGroup,
  } = useContext(DataContext);

  
  const puzzleGroupName = currentPuzzleGroup ? currentPuzzleGroup.name : "null";
  const puzzles = isPuzzleGroup(puzzleGroupName) ? puzzlesSortedByGroup[puzzleGroupName] : null; 

  useEffect(() => {
    console.log("PuzzleGroupMenu: useEffect: completedPuzzleIds, puzzlesSortedByGroup:", completedPuzzleIds, puzzlesSortedByGroup);
    console.log("PuzzleGroupMenu: useEffect: puzzles:", puzzles);
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
            puzzles={puzzles}
          />
          {/* <h1>Todo:</h1>
          <ul>
            <li>Implement this after PuzzleListMenu and PuzzleMenu as an extra layer</li>
            <li>Group puzzles from like sets together, pulling info from the set here</li>
            <li>When user reaches here, <strong>change background color to set color</strong></li>
          </ul> */}

          {/* Temp button to start game */}

          {/* <p>
            <Button
              iconType="play"
              onClick={() => {
                setGameIsActive(true)
                toggleMenu()
              }}
            >
              Start Puzzle
            </Button>
          </p> */}
        </div>

      </div>

    </div>
  );
}
 
export default PuzzleGroupMenu;