import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';

const PuzzleMenu = () => {
  return ( 
    <div className="puzzle-menu menu">
      <MenuHeader
        iconType="puzzle"
        title="PUZZLE_NAME"
      />

      <div className="menu-body-container">
        <MenuLinks
          excludeAll={true}
          showBackButton={true}
        />

        <div className="menu-body">
          <h1>Todo:</h1>
          <ul>
            <li>Display info for selected puzzle and prompts to start or go back</li>
            <li>Include whether user has completed it and reveal the puzzle if so</li>
            <li>Also include clear times/relevant stats if completed</li>
            <li>When user reaches here, <strong>change bg color to puzzle color</strong></li>
            <li>Above might already happen at <code>PuzzleSetMenu</code>, but we want to account for that step being skipped and a puzzle loaded directly.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
 
export default PuzzleMenu;