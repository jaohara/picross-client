import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import { 
  useNavigate
} from 'react-router-dom';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';
import { DataContext } from '../../../contexts/DataContext';

import Button from '../../../components/Button/Button';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';
import PuzzleGroupContainer from '../../../components/PuzzleGroupContainer/PuzzleGroupContainer';

const excludedRoutes = [
  // maybe I should have an "exclude all" option in MenuLinks?
  "login",
  // "title",
  "options",
  "puzzle-group",
  "puzzle",
  "profile",
  "pause",
  "signup",
];

const PuzzleListMenu = () => {
  const navigate = useNavigate();

  const {
    clearCurrentPuzzleGroup,
    currentPuzzleGroup,
    navigateToPuzzleGroup,
    selectPuzzleGroup,
  } = useContext(GameContext);

  const {
    puzzlesSortedByGroup,
  } = useContext(DataContext);

  const {
    completedPuzzleIds,
  } = useContext(UserContext);

  const handlePuzzleGroupClick = (e, groupName, puzzle) => {
    e.preventDefault();
    selectPuzzleGroup(groupName, puzzle);
  } 

  // using this to wait until the group has been selected before navigating to new
  //  page. Will this lead to poor responsiveness?
  useEffect(() => {
    if (currentPuzzleGroup && !currentPuzzleGroup.hasNavigated) {
      // navigate('/puzzle-group');
      navigateToPuzzleGroup(navigate);
    }
  }, [currentPuzzleGroup, navigate]);

  useEffect(() => {
    if (currentPuzzleGroup) {
      clearCurrentPuzzleGroup();
    }
  }, []);

  return ( 
    <div className="puzzle-list-menu menu">
      <MenuHeader
        iconType="puzzle-list"
        title="Puzzle List"
      />

      <div className="menu-body-container">
        <MenuLinks 
          excluded={excludedRoutes}
          // excludeAll={true}
          showBackButton={true}
        />

        <div className="menu-body">
          <PuzzleGroupContainer
            completedPuzzleIds={completedPuzzleIds}
            handlePuzzleGroupClick={handlePuzzleGroupClick}
            puzzlesSortedByGroup={puzzlesSortedByGroup}
          />


          <div className="puzzle-list-todo">
            <h1>Todo:</h1>
            <ul>
              <li>Display a list of all puzzles stored in <code>GameContext</code>, sorted by set</li>
              <li>Maybe add set sorting later?</li>
              <li>After sorted by Set, a click on one goes to <code>PuzzleSetMenu</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default PuzzleListMenu;