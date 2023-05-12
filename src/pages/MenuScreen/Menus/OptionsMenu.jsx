import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const OptionsMenu = () => {
  return ( 
    <div className="options-menu menu">
      <h1>Options Menu</h1>
      <p>
        Hey, I&apos;m the options menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Figure out which options are controlled here and where they're saved</li>
          <li>Does this control GameContext Stuff?</li>
          <li>Should these be saved locally or saved in UserContext?</li>
        </ul>
      </div>
    </div>
  );
}
 
export default OptionsMenu;