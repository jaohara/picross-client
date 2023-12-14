import React from 'react';

import "./MenuSection.scss";

const bgShadeTypes = ["dark", "normal", "light", "lighter", "darker"];

// hex codes for opacity for the color strings
const bgShadeOpacities = {
  // .1
  "lighter": "19",
  // .3
  "light": "4c",
  // .5
  "normal": "7f",
  // .65
  "dark": "a5",
  // .8
  "darker": "cc",
};

// maps int indexes to css class names for different vertical padding values
const verticalPaddingClassNames = [
  "no-padding",
  "default-padding",
  "more-padding",
];

const buildHexColorString = (hexColorString, opacityString = "normal") => {
  const color = hexColorString.includes("#") ? hexColorString : `#${hexColorString}`;
  const alpha = Object.keys(bgShadeOpacities).includes(opacityString) 
    ? bgShadeOpacities[opacityString]
    : bgShadeOpacities["normal"]; 

  return `${color}${alpha}`
};

const MenuSection = ({
  // string to modify the shade of the bg
  bgShade = "normal",
  // hex color to tint background
  bgTint,
  children,
  className = "",
  // one of these int values: 0 (none), 1 (default), 2 (double)
  verticalPadding = 1,
}) => {
  // safe string for the type of shade on this bg
  let parsedBgShade = bgShadeTypes.includes(bgShade) ? bgShade : "normal";
  let verticalPaddingClassName = 
    verticalPadding < verticalPaddingClassNames.length && verticalPadding > 0 
      ? verticalPaddingClassNames[verticalPadding] 
      : verticalPaddingClassNames[1];


  const menuSectionClassNames = `
    menu-section
    ${parsedBgShade}-shade
    ${verticalPaddingClassName}
    ${className}
  `;

  const bgColorString = bgTint ? buildHexColorString(bgTint, bgShade) : null;

  const style = bgColorString ? {
    backgroundColor: bgColorString,
  } : {};

  return ( 
    <div 
      className={menuSectionClassNames}
      style={style}
    >
      {children}
    </div>
  );
}
 
export default MenuSection;