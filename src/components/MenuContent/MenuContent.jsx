import React from 'react';

import "./MenuContent.scss";

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import MenuContentGroup from '../MenuContentGroup/MenuContentGroup';

const MenuContent = ({
  card = false,
  // center the content within the component
  centered = false,
  children,
  // the number of columns to use to display child content
  columns = 1,
  // whether the MenuContent width is fixed and centered (default) or full and dynamic
  fullWidth = false,
  // whether the MenuContent indicates its hover state
  hoverHighlight = false,
  // whether or not the data that the content depends on is loaded 
  loading = false,
  onClick,
  onMouseDown,
  onMouseEnter,
  // whether the bg is opaque (replace with strings for degrees of opacity?)
  opaque = true,
}) => {
  const menuContentClassNames = `
    menu-content
    ${card ? "menu-card" : ""}
    ${centered ? "centered" : ""}
    ${fullWidth ? "full-width" : "fixed-width"}
    ${hoverHighlight ? "hover-highlight" : ""}
    ${opaque ? "opaque-bg" : "transparent-bg" }
  `;




  
  // TODO: code out "hover-highlight" class in the stylesheet

  
  

  
  
  const content = (() => {
    if (loading) {
      return (<LoadingSpinner />);
    }

    if (columns === 1) {
      return children;
    }

    return (
      <MenuContentGroup
        columns={columns}
      >
        {children}
      </MenuContentGroup>
    );
  })();

  return (
    <div 
      className={menuContentClassNames}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {content}
    </div>
  )
};
 
export default MenuContent;