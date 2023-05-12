import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const PuzzleListMenu = () => {
  return ( 
    <div className="puzzle-list-menu menu">
      <h1>PuzzleList Menu</h1>
      <p>
        Hey, I&apos;m the puzzle list menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Display a list of all puzzles stored in <pre>GameContext</pre>, sorted by set</li>
          <li>Maybe add set sorting later?</li>
          <li>After sorted by Set, a click on one goes to <pre>PuzzleSetMenu</pre></li>
        </ul>
      </div>
    </div>
  );
}
 
export default PuzzleListMenu;