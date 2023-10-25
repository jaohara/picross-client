import React from 'react';

import "./HorizontalDivider.scss";

const HorizontalDivider = ({ 
  addTopMargin = false,
  extraBottomMargin = false,
}) => {
  const classNames = `horizontal-divider 
    ${addTopMargin ? "has-top-margin" : ""}
    ${extraBottomMargin ? "extra-bottom-margin" : ""}
  `;

  return ( 
    <div className={classNames}>&nbsp;</div>
  );
}
 
export default HorizontalDivider;