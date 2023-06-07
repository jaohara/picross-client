import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./BackgroundScreen.scss";

import { GameContext } from '../../contexts/GameContext';

import {
  BACKGROUND_DEFAULT_COLOR_ONE,
  BACKGROUND_DEFAULT_COLOR_TWO,
} from "../../constants";

const BackgroundScreen = () => {
  const { 
    currentPuzzleGroup
  } = useContext(GameContext);

  const backgroundColors = 
    currentPuzzleGroup && currentPuzzleGroup.colors && Array.isArray(currentPuzzleGroup.colors) ?
      [ currentPuzzleGroup.colors[0], currentPuzzleGroup.colors[1] ] :
      [ BACKGROUND_DEFAULT_COLOR_ONE, BACKGROUND_DEFAULT_COLOR_TWO];

  // TODO: This needs to pull whatever color has been set in GameContext
  // and dynamically update the background color gradient based on this

  return ( 
    <div 
      className="background-screen screen"
      style={{
        background: `linear-gradient(${backgroundColors[0]}, ${backgroundColors[1]})`,
      }}
    >
      <p></p>
    </div>
  );
}
 
export default BackgroundScreen;