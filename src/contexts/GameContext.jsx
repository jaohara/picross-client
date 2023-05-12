import React, {
  createContext,
  useEffect,
  useState,
} from "react";

// TODO: import necessary api functions

const GameContext = createContext(undefined);

const GameContextProvider = ({ children }) => {
  // whether or not the game menu is active
  const [ menuIsActive, setMenuIsActive ] = useState(true);
  // used to block toggling the menu (when no board is loaded, etc)
  const [ menuScreenToggleLock, setMenuScreenToggleLock ] = useState(false);
  
  // TODO: Include some way to save current background colors, as well as 
  // a function to get current background colors from a puzzle
  //
  // Make sure that BackgroundScreen pulls this color to change dynamically
  
  const toggleMenu = () => 
    !menuScreenToggleLock && setMenuIsActive((currentMenuState) => !currentMenuState);

  return (
    <GameContext.Provider
      value={{
        menuIsActive: menuIsActive,
        setMenuIsActive: setMenuIsActive,
        toggleMenu: toggleMenu,
      }}
    >
      {children}
    </GameContext.Provider>
  )
};

export { GameContext, GameContextProvider };
