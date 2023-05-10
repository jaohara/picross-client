import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./MenuScreen.scss";

import Button from "../../components/Button/Button";

import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';

const MenuScreen = () => {
  const {
    menuIsActive,
    setMenuIsActive,
    toggleMenu,
  } = useContext(GameContext);

  const { userContextTestVal } = useContext(UserContext);

  const menuScreenClassNames = `
    menu-screen
    screen
    ${menuIsActive ? "active" : ""}
  `;

  return ( 
    <div className={menuScreenClassNames}>
      Hey, I&apos;m the menu screen!

      <h1>Toggle Menu</h1>
      <p>
        <Button
          onClick={toggleMenu}
          iconType='menu'
        >
          Toggle Menu Screen
        </Button>
      </p>

      <h1>Context Values</h1>

      <ul>
        <li><strong>menuIsActive:</strong>&nbsp;{`${menuIsActive}`}</li>
      </ul>

      <p>
        <strong>userContextTestVal:</strong>&nbsp;{userContextTestVal} 
      </p>
    </div>
  );
}
 
export default MenuScreen;