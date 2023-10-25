import React from 'react';

import { 
  TbArrowBack,
  TbAward,
  TbBomb,
  TbClock,
  TbCloudDownload,
  TbCloudUpload,
  // TbFileCode, // maybe for save?
  // TbFileDownload, // maybe for save?
  TbHierarchy2,
  TbHome,
  TbLoader,
  TbLogin,
  TbLogout,
  // TbMedal, // alternate for complete?
  TbMenu2,
  TbNews,
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPuzzle,
  // this looks like a swastika. Don't use this.
  // TbPuzzle2,
  TbPuzzleOff,
  TbReload,
  TbSettings,
  TbStethoscope,
  TbStethoscopeOff,
  // TbTrash, // maybe for delete?
  TbTrashX,
  TbUserCircle,
  TbUserPlus,
  TbX,
} from "react-icons/tb";

import './Button.scss';

const Button = ({
  children,
  className = "",
  disabled,
  isFormSubmit = false,
  onClick,
  onMouseOut = () => {},
  iconType = "none",
}) => {
  const buttonIcons = {
    "back": (<TbArrowBack />),
    "clear": (<TbReload />),
    "complete": (<TbAward />),
    "delete": (<TbTrashX />),
    "diagnostic": (<TbStethoscope />), 
    "diagnostic-on": (<TbStethoscope />), 
    "diagnostic-off": (<TbStethoscopeOff />), 
    "help": (<TbNews />),       
    "log-auth": (<TbUserCircle />),
    "load": (<TbCloudDownload />),
    "login": (<TbLogin />),
    "logout": (<TbLogout />),
    "menu": (<TbMenu2 />),
    "nuke": (<TbBomb />),
    "options": (<TbSettings />),
    "pause": (<TbPlayerPauseFilled />),
    "play": (<TbPlayerPlayFilled />),
    "profile": (<TbUserCircle />),
    "puzzle": (<TbPuzzle />),
    "puzzle-group": (<TbHierarchy2 />),
    "puzzle-list": (<TbPlayerPlayFilled />),       
    "puzzle-off": (<TbPuzzleOff />),
    "puzzle-on": (<TbPuzzle />),
    "quit": (<TbX />),
    "restart": (<TbReload />),
    // "save": (<TbFileCode />),
    // "save": (<TbFileDownload />),
    "save": (<TbCloudUpload />),
    "signup": (<TbUserPlus />),
    "time": (<TbClock />),
    "title": (<TbHome />),
    "waiting": (<TbLoader />)
  };

  const availableIcons = Object.keys(buttonIcons);

  const getButtonIcon = () => {
    if (!availableIcons.includes(iconType)) {
      return;
    }

    return (
      <div 
        className={`
          button-icon-wrapper
          ${!children ? "no-margin" : ""}
          ${iconType === "waiting" ? "waiting" : ""}
      `}>
        {buttonIcons[iconType]}
      </div>
    );
  };

  return (
    <button 
      disabled={disabled}
      className={`${className} app-button`}
      onClick={onClick}
      onMouseOut={onMouseOut}
      type={isFormSubmit ? "submit" : "button"}
    >
      {children}
      {getButtonIcon()}
    </button>
  );
}
 
export default Button;