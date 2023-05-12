import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const TitleMenu = () => {
  return ( 
    <div className="title-menu menu">
      <h1>Title Menu</h1>
      <p>
        Hey, I&apos;m the title menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Display login prompt if user isn't logged in</li>
          <li>Display Play/Options/Profile buttons if user is logged in</li>
        </ul>
      </div>
    </div>
  );
}
 
export default TitleMenu;