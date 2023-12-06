import React from 'react';

import Icon from '../Icon/Icon';

import "./PuzzleSizeIcon.scss";

// naming is a little wonky - maybe PuzzleSizePill?
const PuzzleSizeIcon = ({
  leftMargin,
  puzzleHeight = 5,
  puzzleWidth = 5,
  rightMargin,
}) => {
  const className = puzzleWidth ? `puzzle-size-${puzzleWidth}-icon` : "";

  const labelString = (() => {
    if (puzzleWidth && puzzleHeight) {
      return `${puzzleWidth} x ${puzzleHeight}`;
    }

    return "no-size";
  })();

  return ( 
    <Icon
      className={className + " puzzle-size-icon"}
      iconType='size'
      label={labelString}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
    />
  );
}
 
export default PuzzleSizeIcon;