import React, {
  useContext,
} from 'react';

import { 
  // BrowserRouter as Router,
  // Link,
  MemoryRouter as Router,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import "./MenuScreen.scss";

import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';

// menu subscreens
import LoginMenu from './Menus/LoginMenu';
import OptionsMenu from './Menus/OptionsMenu';
import PauseMenu from './Menus/PauseMenu';
import ProfileMenu from './Menus/ProfileMenu';
import PuzzleMenu from './Menus/PuzzleMenu';
import PuzzleListMenu from './Menus/PuzzleListMenu';
import PuzzleGroupMenu from './Menus/PuzzleGroupMenu';
import SignupMenu from './Menus/SignupMenu';
import TitleMenu from './Menus/TitleMenu';

import AppCredits from '../../components/AppCredits/AppCredits';
import MenuHeader from '../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../components/MenuLinks/MenuLinks';

const MenuScreen = () => {
  const {
    menuIsActive,
    setMenuIsActive,
    toggleMenu,
  } = useContext(GameContext);

  const menuScreenClassNames = `
    menu-screen
    screen
    ${menuIsActive ? "active" : ""}
  `;

  // TODO: Am I going to use react-router-dom here, or sort of write my own
  // mini routing solution? I don't know if I want to have the submenu screens 
  // accessible via a route in case users do stuff out of sequence.
  // 
  // - I am going with react-router-dom, as I can use the `Outlet` components
  //   to render sub-routes that won't update the url bar.

  return ( 
    <div className={menuScreenClassNames}>
      {/* TODO: Move this to its own component so that it can exist in App? */}
      {/* <div className="menu-controls">
        <Button
          onClick={toggleMenu}
          iconType='menu'
        >
          {
            menuIsActive ? "Close" : "Menu"
          }
        </Button>
      </div> */}

      <Router>
        <Routes>
          <Route path='/' element={<TitleMenu />} />
          <Route path='/diag' element={<DiagnosticMenu />} />
          <Route path='/login' element={<LoginMenu />} />
          <Route path='/options' element={<OptionsMenu />} />
          <Route path='/pause' element={<PauseMenu />} />
          <Route path='/profile' element={<ProfileMenu />} />
          <Route path='/puzzle' element={<PuzzleMenu />} />
          <Route path='/puzzle-list' element={<PuzzleListMenu />} />
          <Route path='/puzzle-group' element={<PuzzleGroupMenu />} />
          <Route path='/signup' element={<SignupMenu />} />
          <Route path='/title' element={<TitleMenu />} />
        </Routes>

        <div className="menu-screen-submenu-container">
          <Outlet />
        </div>
      </Router>

      <AppCredits />
    </div>
  );
}

const DiagnosticMenu = () => {
  return (
    <div className="diagnostic-menu menu">
      <MenuHeader
        iconType="diag"
        title="Diagnostic Route"
      />

      <div className="menu-body-container">
        <MenuLinks />

        <div className="menu-body">
          <p>
            I&apos;m the diagnostic route that shows all submenu routes.
          </p>
        </div>
      </div>
    </div>
  )
}
 
export default MenuScreen;