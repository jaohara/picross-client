import {
  useEffect,
  useRef,
  // useState,
} from "react";

// import callbackIsValid from "../utils/callbackIsValid.js";

export default function useHotKeys({
  toggleMenu = () => console.log("toggleMenu hotkey fired"),
}) {
  const keysHeld = useRef([]);

  const keyIsHeld = (key) => keysHeld.current.includes(key);

  const toggleKeyHeld = (key) => {
    console.log("toggleKeyHeld: starting with keysHeld.current:", keysHeld.current);

    const filteredKeysHeld = keysHeld.current.filter(
      currentKey => currentKey !== key 
    );

    if (filteredKeysHeld.length < keysHeld.current.length) {
      // return filtered array
      console.log(`toggleKeyHeld: removed '${key}' from keysHeld.current`);
      keysHeld.current = filteredKeysHeld; 
      return;
    }
    
    // add key to array
    console.log(`toggleKeyHeld: adding '${key}' to keysHeld.current`);
    keysHeld.current = [...keysHeld.current, key]; 
    return;
  }

  const hotkeyBindings = {
    "Escape": toggleMenu,
  }

  const hotkeys = Object.keys(hotkeyBindings);

  const handleKeyDown = (event) => {
    // console.log("in handleKeyDown")
    const { key } = event;
    
    if (hotkeys.includes(key) && !keyIsHeld(key)) {
      console.log(`Hotkey '${key}' was pressed.`);
      toggleKeyHeld(key);
      const action = hotkeyBindings[key];
      // callbackIsValid(action) && action();
      action();
    } 
  };

  const handleKeyUp = (event) => {
    const { key } = event;
    keyIsHeld(key) && toggleKeyHeld(key);
  }

  // hotkeys bound on initial load
  useEffect(() => {
    console.log("useHotKeys: in useEffect");

    // ensure that keysHeld.current is initialized to an empty array
    keysHeld.current = [];

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // unbind when component is destroyed
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    }
  }, []);
}