import React from 'react';

import "./MenuContentGroup.scss";

const MAX_COLUMNS = 8;

const MenuContentGroup = ({
  children,
  columns = 3,
}) => {
  const childCount = React.Children.count(children);
  const parsedColumns = childCount < columns ? childCount : columns;

  const menuContentGroupClassNames = `
    menu-content-group
    columns-${parsedColumns <= MAX_COLUMNS ? parsedColumns : MAX_COLUMNS}
  `;

  return ( 
    <div className={menuContentGroupClassNames}>
      {children}
    </div>
  );
}
 
export default MenuContentGroup;