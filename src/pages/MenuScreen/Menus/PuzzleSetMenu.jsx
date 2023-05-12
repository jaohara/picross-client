import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const PuzzleSetMenu = () => {
  return ( 
    <div className="puzzle-set-menu menu">
      <h1>PuzzleSet Menu</h1>
      <p>
        Hey, I&apos;m the puzzle set menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Implement this after PuzzleListMenu and PuzzleMenu as an extra layer</li>
          <li>Group puzzles from like sets together, pulling info from the set here</li>
          <li>When user reaches here, <strong>change background color to set color</strong></li>
        </ul>
      </div>
    </div>
  );
}
 
export default PuzzleSetMenu;