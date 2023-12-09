import React from 'react';

import "./MenuContent.scss";

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const MenuContent = ({
  children,
  // whether the MenuContent width is fixed and centered (default) or full and dynamic
  fullWidth = false,
  // whether or not the data that the content depends on is loaded 
  loading = false,
  // whether the bg is opaque (replace with strings for degrees of opacity?)
  opaque = true,
}) => {
  const menuContentClassNames = `
    menu-content
    ${fullWidth ? "full-width" : "fixed-width"}
    ${opaque ? "opaque-bg" : "transparent-bg" }
  `;

  const content = loading ? (<LoadingSpinner />) : children

  return (
    <div className={menuContentClassNames}>
      {content}
    </div>
  )
};
 
export default MenuContent;