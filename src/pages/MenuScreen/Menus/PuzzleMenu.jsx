import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const PuzzleMenu = () => {
  return ( 
    <div className="puzzle-menu menu">
      <h1>Puzzle Menu</h1>
      <p>
        Hey, I&apos;m the puzzle menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Display info for selected puzzle and prompts to start or go back</li>
          <li>Include whether user has completed it and reveal the puzzle if so</li>
          <li>Also include clear times/relevant stats if completed</li>
          <li>When user reaches here, <strong>change bg color to puzzle color</strong></li>
          <li>Above might already happen at <pre>PuzzleSetMenu</pre>, but we want to account for that step being skipped and a puzzle loaded directly.</li>
        </ul>
      </div>
    </div>
  );
}
 
export default PuzzleMenu;