import React from 'react';

import { 
  TbArrowBack,
  TbAward,
  TbBolt,
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
  TbPencil,
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPuzzle,
  // this looks like a swastika. Don't use this.
  // TbPuzzle2,
  TbPuzzleOff,
  TbQuestionMark,
  // TbQuestionCircle,
  TbReload,
  TbRuler,
  TbSettings,
  TbStethoscope,
  TbStethoscopeOff,
  // TbTrash, // maybe for delete?
  TbTrashX,
  TbUserCircle,
  TbUserPlus,
  TbX,
} from "react-icons/tb";
import "./Icon.scss";

const Icon = ({
  className,
  leftMargin = false,
  label,
  iconType = "none",
  rightMargin = true,
}) => {
  // TODO: a lot of code repeated with this and the icon portion of Button.
  // I should make Button use this Icon internally.
  const iconSet = {
    "back": (<TbArrowBack />),
    "clear": (<TbReload />),
    "complete": (<TbAward />),
    "delete": (<TbTrashX />),
    "diagnostic": (<TbStethoscope />), 
    "diagnostic-on": (<TbStethoscope />), 
    "diagnostic-off": (<TbStethoscopeOff />),
    "fastest": (<TbBolt />), 
    "help": (<TbNews />),    
    "in-progress": (<TbPencil />),   
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
    "question": (<TbQuestionMark />),
    "restart": (<TbReload />),
    // "save": (<TbFileCode />),
    // "save": (<TbFileDownload />),
    "save": (<TbCloudUpload />),
    "signup": (<TbUserPlus />),
    "size": (<TbRuler />),
    "time": (<TbClock />),
    "title": (<TbHome />),
    "waiting": (<TbLoader />)
  };

  const FALLBACK_ICON_TYPE = "question";

  const availableIcons = Object.keys(iconSet);

  const getIconLabel = () => {
    if (!label) return;

    return (
      <div className="ui-icon-label">
        {label}
      </div>
    )
  }

  const classNames = `
    ui-icon-wrapper
    ${leftMargin ? "ui-icon-left-margin" : ""}
    ${rightMargin ? "ui-icon-right-margin" : ""}
    ${className}
  `;

  const getIcon = () => {
    const iconElement = availableIcons.includes(iconType) 
      ? iconSet[iconType]
      : iconSet[FALLBACK_ICON_TYPE];

    const iconLabel = getIconLabel();

    return (
      <div className={classNames}>
        {iconElement}
        {iconLabel}
      </div>
    );
  };

  return getIcon();
};

export default Icon;
