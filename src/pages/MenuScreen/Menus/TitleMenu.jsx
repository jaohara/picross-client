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
          <h1>Title Screen Body Content</h1>
          <p>
            This should be displayed to the right of the controls.
          </p>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam voluptatem, at molestiae voluptatibus fuga ab. At corporis architecto perspiciatis. Nam quasi commodi eum architecto a debitis, labore dignissimos. Nobis, dignissimos?
          </p>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis nobis repellendus debitis blanditiis magnam at incidunt id odit dicta quae tenetur, earum voluptates, sint accusamus molestiae. Ab dolores accusantium recusandae.
          </p>

          <h1>Hey you! Yeah, you, you fucking champion! You got the puzzle and achievement data via DataContext, display it here when you get back to work!</h1>
        </div>
      </div>
    </div>
  );
}
 
export default TitleMenu;