import React, { 
  useContext,
  useEffect,
} from 'react';

import { 
  Link, 
  Navigate,
  useLocation,
  useNavigate, 
} from 'react-router-dom';

import { DataContext } from '../../contexts/DataContext';
import { UserContext } from '../../contexts/UserContext';

import Button from '../Button/Button';

import { menuRoutes } from '../../routes';

const MenuLinks = ({
  // can be passed an array of Button elements to appear after the route buttons
  appendedButtons = [],
  // used to exclude all links, probably with "showBackButton" === true
  excludeAll = false,
  // used to exclude links from being displayed on a menu page
  excluded = [],
  // can be passed an array of Button elements to appear before the route buttons
  prependedButtons = [],
  // can be used to override 
  renamedMappings = {},
  // used to display a back button
  showBackButton = false,
  // whether to include the root test route 
  showDiagnosticRoute = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRouteName = location.pathname.replace("/", "");

  const renamedMappingKeys = Object.keys(renamedMappings);

  const { 
    userProfileIsLoading, 
  } = useContext(UserContext);

  const { 
    puzzlesAreLoading,
  } = useContext(DataContext);

  const resourcesAreLoading = userProfileIsLoading || puzzlesAreLoading;
  
  // hides excluded routes as well as current route
  const filteredRoutes = menuRoutes.filter(
    (route) => !excluded.includes(route) && route !== currentRouteName
  );

  // helper function to format route names, which replaces hyphens with
  //  spaces and capitalizes each word
  const formatRouteName = (routeName) => {
    if (renamedMappingKeys.includes(routeName)) {
      return renamedMappings[routeName];
    }

    const routeNameParts = routeName.split("-");
    const formattedRouteName = routeNameParts.map(
      (part) => `${part[0].toUpperCase()}${part.slice(1)}`
    );
    return formattedRouteName.join(" ");
  };
  
  const routeLinks = filteredRoutes.map((route, index) => (
    <li
      className='menu-link-list-item'
      key={`menu-link-list-item-${index}`}
    >
      <Button
        // disabled={resourcesAreLoading}
        loading={resourcesAreLoading}
        iconType={route}
        onClick={() => navigate(`/${route}`) }
      >
        {formatRouteName(route)}
      </Button>
    </li>
  ));

  const checkIfIsArrayAndHasElements = (input) => Array.isArray(input) && input.length > 0;

  const hasAppendedButtons = checkIfIsArrayAndHasElements(appendedButtons);
  const hasPrependedButtons = checkIfIsArrayAndHasElements(prependedButtons);
  const canGoBack = location.key !== "default";

  const buildExtraButtonElements = (buttonArray, extraType) => 
    buttonArray.map((button, index) => (
      <li
        className={`menu-link-list-item ${extraType}-button`}
        key={`menu-luink-list-item-${extraType}-button-${index}`}
      >
        {button}
      </li>
    ));
    
  const appendedButtonElements = buildExtraButtonElements(appendedButtons, "appended");
  const prependedButtonElements = buildExtraButtonElements(prependedButtons, "prepended");
  
  const backButton = showBackButton && canGoBack ? (
    <li
      className='menu-link-list-item'
      key={`menu-link-list-item-back`}
    >
      <Button
        iconType='back'
        // passing -1 to navigate goes back one in the nav stack
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
    </li>
  ) : ("");  

  const diagnosticRouteButton = (
    <li
      className='menu-link-list-item'
      key={`menu-link-list-item-diag`}
    >
      <Button 
        onClick={() => navigate("/diag")}
        iconType='diagnostic'
      >
        Test All Routes
      </Button>
    </li>
  )

  useEffect(() => {
    // TODO: Remove debug logging
    // console.log(`in MenuLinks useEffect for ${currentRouteName}`);
    // console.log("all menu routes are:", menuRoutes);
    // console.log("excluded routes are:", excluded);
    // console.log("renamed routes are:", renamedMappings);
    // console.log("filtered routes are:", filteredRoutes);
  }, []);

  return ( 
    <div className="menu-links-wrapper">
      <ul className="menu-links-list">
        {hasPrependedButtons && prependedButtonElements}
        {!excludeAll && routeLinks}
        {hasAppendedButtons && appendedButtonElements}
        {backButton}
        {showDiagnosticRoute && diagnosticRouteButton}
      </ul>
    </div>
  );
}
 
export default MenuLinks;