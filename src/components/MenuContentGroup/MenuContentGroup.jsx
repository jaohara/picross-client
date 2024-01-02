import React from 'react';

import "./MenuContentGroup.scss";

const MAX_COLUMNS = 8;

// used to validate the "firstChildSize" prop
const validCSSUnits = [ "px", "em", "rem", "%", "pt", "cm", "vh", "vw", "ch", "ex", "vmin", "vmax"]

const MenuContentGroup = ({
  children,
  columns = 3,
  // a string for a CSS size value to assign a fixed width to the first child column
  firstChildSize,
  style,
}) => {
  const childCount = React.Children.count(children);
  const parsedColumns = childCount < columns ? childCount : columns;

  const parsedFirstChildFlexStyle = (() => {
    if (!firstChildSize || typeof firstChildSize !== "string") return null;

    const tempSizeString = firstChildSize.toLowerCase();
    const hasValidUnit = validCSSUnits.some((unit) => tempSizeString.includes(unit));

    if (hasValidUnit) return `0 0 ${tempSizeString}`;

    return null;
  })();

  const parsedChildren = React.Children.map(children, (child, index) => {
    if (!parsedFirstChildFlexStyle || index !== 0) {
      console.log(`MenuContentGroup: ${firstChildSize}, ${parsedFirstChildFlexStyle}`);
      return child;
    }

    return React.cloneElement(child, { style: {
      "flex": parsedFirstChildFlexStyle,
      "maxWidth": firstChildSize,
      "minWidth": firstChildSize,
    }});
  });
  
  const menuContentGroupClassNames = `
    menu-content-group
    columns-${parsedColumns <= MAX_COLUMNS ? parsedColumns : MAX_COLUMNS}
    ${firstChildSize ? "fixed-first-child" : ""}
  `;

  return ( 
    <div 
      className={menuContentGroupClassNames}
      style={style}
    >
      {/* {children} */}
      {parsedChildren}
    </div>
  );
}
 
export default MenuContentGroup;