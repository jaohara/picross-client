import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

const UserMenu = () => {
  return ( 
    <div className="user-menu menu">
      <h1>User Menu</h1>
      <p>
        Hey, I&apos;m the user menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Show user statistics summary</li>
          <li>Show unlocked achievements</li>
          <li>Maybe allow a user to pick a puzzle as their avatar?</li>
          <li>This needs some sort of dynamic avatar/profile rank icon, as well as cool visualization for stats,</li>
        </ul>
      </div>
    </div>
  );
}
 
export default UserMenu;