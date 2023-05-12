import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import Button from '../../../components/Button/Button';
import TextInput from '../../../components/TextInput/TextInput';

const LoginMenu = () => {
  return ( 
    <div className="login-menu menu">
      <h1>Login Menu</h1>
      <p>
        Hey, I&apos;m the login menu!
      </p>

      <div className="menu-todo">
        <h2>Todo:</h2>
        <ul>
          <li>Port most of the stuff from <pre>LoginWindow</pre> and <pre>LoginContainer</pre> into here</li>
        </ul>
      </div>
    </div>
  );
}
 
export default LoginMenu;