import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const PauseMenu = () => {
  return ( 
    <div className="pause-menu menu">
      <h1>Pause Menu</h1>
      <p>
        Hey, I&apos;m the pause menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Make this navigate somewhere else if a game isn't in session</li>
          <li>Add controls to interact with <pre>GameContext</pre> for current game session - restart, quit, etc.</li>
          <li>Should this go to <pre>OptionsMenu</pre> as well?</li>
        </ul>
      </div>
    </div>
  );
}
 
export default PauseMenu;