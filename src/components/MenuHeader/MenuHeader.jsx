import React from 'react';

import {
  TbHierarchy2,
  // TbHome,
  TbLogin,
  TbNews,
  TbPuzzle,
  TbPlayerPauseFilled,
  TbSettings,
  TbStethoscope,
  TbUserCircle,
  TbUserPlus,
} from "react-icons/tb"

import { MENU_HEADER_ICON_SIZE as ICON_SIZE } from '../../constants';

const MenuHeader = ({
  iconType,
  noIcon = false,
  title,
}) => {
  const icons = {
    "diag": (<TbStethoscope size={ICON_SIZE} />),
    "login": (<TbLogin size={ICON_SIZE} />),
    "options": (<TbSettings size={ICON_SIZE} />),
    "pause": (<TbPlayerPauseFilled size={ICON_SIZE} />),
    "profile": (<TbUserCircle size={ICON_SIZE} />),
    "puzzle-group": (<TbHierarchy2 size={ICON_SIZE} />),
    "puzzle-list": (<TbNews size={ICON_SIZE} />),
    "puzzle": (<TbPuzzle size={ICON_SIZE} />),
    "signup": (<TbUserPlus size={ICON_SIZE}/>),
    "title": (<TbPuzzle size={ICON_SIZE} />),
  }

  const iconElement = (
    <div className="menu-header-icon-wrapper">
      {icons[iconType]}
    </div>
  )

  return (
    <div className="menu-header-container">
      <h1 className="menu-header">
        {title}
      </h1>

      {!noIcon && iconElement}
    </div>
  );
}
 
export default MenuHeader;
