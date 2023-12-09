import React from 'react';

import "./MenuContentGroup.scss";

// TODO: Have this dynamically receive JSX children as an array in props (does children)

// MIGHT BE A LOT LESS WORK THAN I'M THINKING?
// this is basically just a flexbox div to make things go horizontally rather than vertically

const MenuContentGroup = ({children}) => {
  return ( 
    <div className="menu-content-group">
      {children}
    </div>
  );
}
 
export default MenuContentGroup;