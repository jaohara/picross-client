import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./BackgroundScreen.scss";

import { GameContext } from '../../contexts/GameContext';

const BackgroundScreen = () => {

  // TODO: This needs to pull whatever color has been set in GameContext
  // and dynamically update the background color gradient based on this

  return ( 
    <div className="background-screen screen">
      <p></p>
    </div>
  );
}
 
export default BackgroundScreen;