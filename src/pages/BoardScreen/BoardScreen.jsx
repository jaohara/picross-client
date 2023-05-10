import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./BoardScreen.scss";

import Button from '../../components/Button/Button';

import { GameContext } from '../../contexts/GameContext';

const BoardScreen = () => {
  const {
    menuIsActive,
    toggleMenu,
  } = useContext(GameContext);

  return ( 
    <div className="board-screen screen">
      <div className="board-screen-header board-screen-section">
        <p>
          I will probably contain score info and controls for accessing the menu.
        </p>
      </div>

      <div className="board-screen-content-container board-screen-section">
        Hey, I&apos;m the board screen! This middle container will contain the board.

        <h1>Toggle Menu</h1>
        <p>
          <Button
            onClick={toggleMenu}
            iconType='menu'
          >
            Toggle Menu Screen
          </Button>
        </p>
      </div>

      <div className="board-screen-footer board-screen-section">
        <p>
          I don't know what I will contain, but I'll reserve this space.
        </p>
      </div>
    </div>
  );
}
 
export default BoardScreen;