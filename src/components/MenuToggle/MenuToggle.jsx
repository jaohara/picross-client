import React, {
  useContext,
} from 'react';

import "./MenuToggle.scss";

import { GameContext } from '../../contexts/GameContext';

import Button from '../Button/Button';

const MenuToggle = () => {
  const {
    gameIsActive,
    menuIsActive,
    toggleMenu,
    togglePauseGame,
  } = useContext(GameContext);

  const handleMenuToggleClick = () => {
    // console.log("MenuToggle: gameDuration is:", gameDuration);
    // console.log("MenuToggle: pauseDuration is:", pauseDuration);
    togglePauseGame(Date.now());
    toggleMenu();
  }

  const menuToggleClassNames = `
    menu-toggle
    ${gameIsActive ? "active" : ""}
  `;

  return ( 
    <div className={menuToggleClassNames}>
      <Button
        onClick={handleMenuToggleClick}
        iconType={menuIsActive ? "quit" : "menu"}
      >
        {
          menuIsActive ? "Close" : "Menu"
        }
      </Button>
    </div>
  );
}
 
export default MenuToggle;