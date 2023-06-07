import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

import { Navigate } from "react-router-dom";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import Button from '../../../components/Button/Button';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';

import { menuRoutes } from "../../../routes";

const excludedRoutes = menuRoutes.filter((route) => route !== "options");

const PauseMenu = () => {
  const {
    gameIsActive,
    gameIsPaused,
    quitGame,
    toggleMenu,
    togglePauseGame,
  } = useContext(GameContext);

  if (!gameIsActive) {
    return (<Navigate to={"/puzzle-list"} />)
  }

  const handleResume = () => {
    togglePauseGame(Date.now());
    toggleMenu();
  };

  const handleQuit = () => {
    quitGame(false);
  }

  // TODO: These are dummy buttons right now, but I should import whatever
  //  functions I need so that the onClick handlers do whatever they need to do
  const prependedButtons = [
    (
      <Button
        iconType='play' 
        onClick={() => handleResume()}
      >
        Resume
      </Button>
    ),
  ];

  // same as above
  const appendedButtons = [
    (
      <Button
        iconType='restart'
        onClick={() => console.log("PauseMenu: restart clicked")}
      >
        Restart
      </Button>
    ),
    (
      <Button
        iconType='quit'
        onClick={() => handleQuit()}
      >
        Quit
      </Button>
    )
  ]

  return ( 
    <div className="pause-menu menu">
      <MenuHeader
        iconType="pause"
        title="Pause"
      />

      <div className="menu-body-container">
        <MenuLinks 
          appendedButtons={appendedButtons}
          excluded={excludedRoutes}
          prependedButtons={prependedButtons}
          // TODO: Temp for MenuScreen testing, remove this
          // showBackButton={true}
        />

        <div className="menu-body">
          <h1>Game is {gameIsPaused ? "" : "NOT"} paused</h1>
          <h1>Todo:</h1>
          <ul>
            <li>Make this navigate somewhere else if a game isn't in session</li>
            <li>Add controls to interact with <code>GameContext</code> for current game session - restart, quit, etc.</li>
            <li>Should this go to <code>OptionsMenu</code> as well?</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
 
export default PauseMenu;