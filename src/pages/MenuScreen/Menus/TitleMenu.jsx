import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

import { TbPuzzle } from "react-icons/tb";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';
import { menuRoutes } from '../../../routes';

import { 
  APP_TITLE,
  APP_VERSION,
  CREDITS_LINE,
  MENU_HEADER_ICON_SIZE as ICON_SIZE,
} from "../../../constants";

const defaultExcludedRoutes = [
  "title",
  "login",
  "signup",
  "puzzle-group",
  "puzzle",
  "pause",
];

const TitleMenu = () => {
  const {
    user,
  } = useContext(UserContext);

  // check if logged in, and exclude all routes but "Login" (and signup? should that 
  // be its own route?)
  const excludedRoutes = !user ? 
    menuRoutes.filter((route) => route !== "login" && route !== "signup") : 
    defaultExcludedRoutes;

  const renamedRoutes = {
    "puzzle-list": "Play",
  };

  return ( 
    <div className="title-menu menu">
      <MenuHeader 
        iconType="title"
        title={APP_TITLE}
      />

      <div className="menu-body-container">
        <MenuLinks 
          excluded={excludedRoutes}
          renamedMappings={renamedRoutes}
          showDiagnosticRoute={true}
        />

        <div className="menu-body">
          <p>
            You need to put some more thought into what should be displayed on this main screen.
          </p>

          <p>
            Should we even land at this main screen? Should you be forwarded to Play or Profile by 
            default?
          </p>

          <p>
            <strong>Should this be where the temporary instructions page is?</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
 
export default TitleMenu;