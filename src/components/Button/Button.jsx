import React from 'react';

import { 
  TbCloudDownload,
  TbCloudUpload,
  TbFileCode, // maybe for save?
  TbFileDownload, // maybe for save?
  TbLoader,
  TbLogin,
  TbLogout,
  TbMenu2,
  TbPuzzle,
  TbPuzzleOff,
  TbReload,
  TbStethoscope,
  TbStethoscopeOff,
  TbTrash, // maybe for delete?
  TbTrashX,
  TbUserCircle,
  TbUserPlus,
} from "react-icons/tb";

import './Button.scss';

const Button = ({
  children,
  className,
  disabled,
  isFormSubmit = false,
  onClick,
  onMouseOut = () => {},
  iconType = "none",
}) => {
  const buttonIcons = {
    "clear": (<TbReload />),
    "delete": (<TbTrashX />),
    "diagnostic-on": (<TbStethoscope />), 
    "diagnostic-off": (<TbStethoscopeOff />), 
    "log-auth": (<TbUserCircle />),
    "load": (<TbCloudDownload />),
    "login": (<TbLogin />),
    "logout": (<TbLogout />),
    "menu": (<TbMenu2 />),
    // "save": (<TbFileCode />),
    // "save": (<TbFileDownload />),
    "save": (<TbCloudUpload />),
    "signup": (<TbUserPlus />),
    "puzzle-off": (<TbPuzzleOff />),
    "puzzle-on": (<TbPuzzle />),
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
      {getButtonIcon()}
      {children}
    </button>
  );
}
 
export default Button;