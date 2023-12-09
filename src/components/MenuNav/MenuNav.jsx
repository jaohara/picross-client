import React from 'react';

import './MenuNav.scss';

import MenuLinks from '../MenuLinks/MenuLinks';

const MenuNav = () => {
  const excludedRoutes = [
    "login",
    "signup",
    "puzzle-group",
    "puzzle",
    "pause",
  ];

  return ( 
    <div className="menu-nav-container">
      <MenuLinks 
        excluded={excludedRoutes}
        hideCurrentRoute={false}
        horizontal
      />
    </div>
  );
}
 
export default MenuNav;