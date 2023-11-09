import React, { 
  useEffect,
  useMemo,
  useState,
} from 'react';

import "./Board.scss";

import {
  BOARD_SQUARE_BORDER_COLOR,
  BOARD_SQUARE_BORDER_RADIUS,
  BOARD_SQUARE_CONTAINER_PADDING,
  BOARD_SQUARE_EMPTY_COLOR,
  BOARD_SQUARE_FILL_COLOR,
  BOARD_SQUARE_GUIDELINE_COLOR,
  BOARD_SQUARE_GUIDELINE_STROKE_WIDTH,
  BOARD_SQUARE_SIZE,
  BOARD_SQUARE_STROKE_WIDTH,
  BOARD_SQUARE_X_COLOR,
  PUZZLE_SQUARE_DELIMITER,
} from "../../constants";


// TODO: REMOVE AFTER REDESIGN IS FINISHED
// const USE_REDESIGNED_SQUARE = false;
const USE_REDESIGNED_SQUARE = true;

const Board = ({
  // gridViewActive,
  puzzleData,
  puzzleGrid,
  puzzleOpacity,
  puzzleIsSolved,
  togglePuzzleGridSquare,
}) => {
  const [ mouseButtonDown, setMouseButtonDown ] = useState(false);

  // I don't think I want to pull these directly to avoid the rerenders when the timer updates
  //  and refreshes the context
  // const {
  //   currentPuzzle: puzzleData,
  //   currentPuzzleGrid: puzzleGrid,
  //   togglePuzzleGridSquare,
  // } = useContext(GameContext);

  const { 
    colors,
    colNumbers,
    height,
    rowNumbers,
    width,
  } = puzzleData;

  const puzzleSize = { height, width };

  // whether we're viewing the b&w grid (game in session) or the image itself (game finished)
  const gridViewActive = !puzzleIsSolved;

  // colNumbers and rowNumbers are saved as strings, parse back into arrays
  const parsedColNumbers = useMemo(() => JSON.parse(colNumbers), [colNumbers]);
  const parsedRowNumbers = useMemo(() => JSON.parse(rowNumbers), [rowNumbers]);

  const puzzle = useMemo(() => {
    console.log("Board: building puzzle from puzzleData.puzzle: ", puzzleData.puzzle);
    if (Array.isArray(puzzleData.puzzle)) {
      return puzzleData.puzzle;
    }

    const { height, width } = puzzleData;
    const result = [];

    const splitPuzzleData = puzzleData.puzzle.split(PUZZLE_SQUARE_DELIMITER);
    let squareIndex = 0;

    for (let y = 0; y < height; y++) {
      result.push([]);

      for (let x = 0; x < width; x++) {
        result[y][x] = splitPuzzleData[squareIndex];
        squareIndex++;
      }
    }

    return result;
  }, [puzzleData]);


  const puzzleIsValid = puzzle && Array.isArray(puzzle) && puzzle.length > 0;

  const parseSquareData = (squareData) => {
    // squareData comes in as "pixelCount:colorIndex";
    const splitSquareData = squareData.split(":");
    
    return ({
      colorIndex: splitSquareData[1],
      color: colors[splitSquareData[1]],
      pixelCount: splitSquareData[0],
    });
  };

  // TODO: append the "color" or whatever className indicates the square is showing
  //  the solved state
  const getSquareClassNames = (squareData) => `
    ${USE_REDESIGNED_SQUARE ? "redesigned-" : ""}board-square
    ${gridViewActive && squareData.isFilled ? "filled" : ""}
    ${gridViewActive && !squareData.isFilled && squareData.isX ? "x" : ""}
    ${gridViewActive && squareData.hasLeftBorder ? "border-left" : ""}
    ${gridViewActive && squareData.hasTopBorder ? "border-top" : ""}
    ${gridViewActive && squareData.hasBottomGuideBorder ? "guide-border-bottom" : ""}
    ${gridViewActive && squareData.hasRightGuideBorder ? "guide-border-right" : ""}
    ${gridViewActive && squareData.hasBottomLeftBorderRadius ? "border-radius-bottom-left" : ""}
    ${gridViewActive && squareData.hasBottomRightBorderRadius ? "border-radius-bottom-right" : ""}
    ${gridViewActive && squareData.hasTopLeftBorderRadius ? "border-radius-top-left" : ""}
    ${gridViewActive && squareData.hasTopRightBorderRadius ? "border-radius-top-right" : ""}
    ${!gridViewActive ? "completed" : ""}
  `;

  useEffect(() => {
    console.log("Board: puzzleData is:", puzzleData);
    console.log("Board: puzzleGrid is:", puzzleGrid);
  }, []);

  const handleSettingMouseButtonDown = (e) => {

    if (mouseButtonDown) {
      console.log("handleSettingMouseButtonDown: already set, aborting");
      return;
    }

    e.preventDefault();

    console.log("handleSettingMouseButtonDown: e.button:", e.button);

    setMouseButtonDown(e.button);
  }

  // TODO: Define logic for different square sizes here
  const boardWrapperClassNames = `
    board-wrapper
    ${ puzzleSize.width > 15 ? "small-squares" : "" }
  `;

  return ( 
    <div className={boardWrapperClassNames}>
      <ColumnNumbers 
        colNumbers={parsedColNumbers}
      />

      <div className="board-row-and-board-wrapper">
        <RowNumbers
          rowNumbers={parsedRowNumbers}
        />

        <div 
          className="board"
          // onMouseDown={() => setMouseButtonDown(true)}
          onMouseDown={handleSettingMouseButtonDown}
          onContextMenu={handleSettingMouseButtonDown}
          onMouseUp={() => setMouseButtonDown(false)}
          onMouseLeave={() => setMouseButtonDown(false)}
        >
          {
            puzzleIsValid && puzzle.map((rowData, index) => (
              <Row
                getSquareClassNames={getSquareClassNames}
                gridViewActive={gridViewActive}
                key={`row-${index}`}
                mouseButtonDown={mouseButtonDown}
                parseSquareData={parseSquareData}
                puzzleGrid={puzzleGrid}
                puzzleOpacity={puzzleOpacity}
                puzzleSize={puzzleSize}
                rowData={rowData}
                togglePuzzleGridSquare={togglePuzzleGridSquare}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

function ColumnNumbers ({
  colNumbers,
}) {
  const numberElements = colNumbers.map((colNumberGroup) => (
    <div className="board-number-container">
      {
        colNumberGroup.map((colNumber) => (
          <div className="board-number">
            {colNumber}
          </div>
        ))
      }
    </div>
  ));

  return (
    <div className="board-column-numbers">
      {numberElements}
    </div>
  );
}

// TODO: This might just be the same component as ColumnNumbers with
// different classNames on the wrapping divs. Maybe refactor sometime later?
function RowNumbers ({
  rowNumbers,
}) {
  const numberElements = rowNumbers.map((rowNumberGroup) => (
    <div className="board-number-container">
      {
        rowNumberGroup.map((rowNumber) => (
          <div 
            className="board-number"
            style={{
              "width": BOARD_SQUARE_SIZE,
            }}
          >
            {rowNumber}
          </div>
        ))
      }
    </div>
  ))

  return (
    <div className="board-row-numbers">
      {numberElements}
    </div>
  );
}

function Row ({ 
  // colors,
  getSquareClassNames,
  gridViewActive,
  puzzleSize,
  mouseButtonDown,
  parseSquareData,
  puzzleGrid,
  puzzleOpacity,
  rowData,
  togglePuzzleGridSquare,
}) {

  // this is assuming rowData is valid
  return (
    <div className="board-row">
      {
        rowData.map((rawSquareData, index) => (
          // <Square
          <MemoizedSquare
            // color={getColorFromSquareData(squareData)}
            getSquareClassNames={getSquareClassNames}
            gridViewActive={gridViewActive}
            key={`square-${index}`}
            // isFilled={false}
            mouseButtonDown={mouseButtonDown}
            parseSquareData={parseSquareData}
            puzzleGrid={puzzleGrid}
            puzzleOpacity={puzzleOpacity}
            puzzleSize={puzzleSize}
            rawSquareData={rawSquareData}
            togglePuzzleGridSquare={togglePuzzleGridSquare}
          />
        ))
      }
    </div>
  );
}

function RedesignedSquare ({
  // color = "#FF0000",
  getSquareClassNames, 
  gridViewActive,
  // isFilled,
  mouseButtonDown,
  parseSquareData,
  puzzleGrid,
  puzzleOpacity = 1,
  puzzleSize,
  // puzzleOpacity = .75,
  rawSquareData,
  togglePuzzleGridSquare,
}) {
  const { color, colorIndex, pixelCount } = (() => {
    // console.log(`parsingSquareData for ${squareData}...`);
    // const timeStarted = Date.now();
    const result = parseSquareData(rawSquareData);
    // const timeElapsed = Date.now() - timeStarted;
    // console.log(`parsedSquareData in ${timeElapsed}`);
    return result;
  })();

  const isFilled = puzzleGrid[pixelCount] === 1;
  const isX = puzzleGrid[pixelCount] === 2;

  
  // guideline and border calculations
  const columnIndex = pixelCount % puzzleSize.width;
  const rowIndex = Math.floor(pixelCount / puzzleSize.width);
  
  const canHaveGuides = puzzleSize.width > 5 && puzzleSize.height > 5;

  const hasRightGuideBorder = canHaveGuides && 
    columnIndex !== puzzleSize.width - 1 &&
    columnIndex % 5 === 4;

  const hasBottomGuideBorder = canHaveGuides &&
    rowIndex !== puzzleSize.height - 1 &&
    rowIndex % 5 === 4;
  
  const hasLeftBorder = columnIndex === 0;
  const hasTopBorder = rowIndex === 0;

  const hasTopLeftBorderRadius = rowIndex === 0 && columnIndex === 0;
  const hasBottomLeftBorderRadius = rowIndex === (puzzleSize.height - 1) && columnIndex === 0;
  const hasTopRightBorderRadius = rowIndex === 0 && columnIndex === (puzzleSize.width - 1);
  const hasBottomRightBorderRadius = 
    rowIndex === (puzzleSize.height - 1) && columnIndex === (puzzleSize.width - 1);

  const squareData = {
    // canHaveGuides,
    hasBottomGuideBorder,
    hasBottomLeftBorderRadius,
    hasBottomRightBorderRadius,
    hasLeftBorder,
    hasRightGuideBorder,
    hasTopBorder,
    hasTopLeftBorderRadius,
    hasTopRightBorderRadius,
    isFilled,
    isX,
  }


  const toggleSquare = (e, continuedFill = null) => {
    e.preventDefault();
    console.log("toggleSquare: event:", e);
    console.log("toggleSquare: mouseButtonDown:", mouseButtonDown);
    console.log("toggleSquare: continuedFill:", continuedFill);
    let fillType;

    if (e.button === 0) {
      fillType = "fill";
    }

    if (e.button === 2) {
      fillType = "x";
    }

    if (continuedFill) {
      fillType = continuedFill;
    }

    console.log("toggleSquare: fillType: ", fillType);

    // if (continuedFill) {
    //   fillType = continuedFill;
    // }
    // else {
    //   // left click happened
    //   if (e.button === 0) {
    //     fillType = "fill";
    //   }

    //   // right click happened
    //   else if (e.button === 2) {
    //     fillType = "x";
    //   }
    // }
    
    gridViewActive && togglePuzzleGridSquare(pixelCount, fillType);
  };

  // TODO: Use these to build click and drag functionality

  const handleMouseIn = (event) => {
    console.log(`handleMouseIn firing on Square ${pixelCount}`, event);

    if (mouseButtonDown === 0 || mouseButtonDown === 2) {
      const continuedFill = mouseButtonDown === 2 ? "x" : "fill";
      console.log("handleMouseIn: mouseButtonDown is set to: ", mouseButtonDown);
      toggleSquare(event, continuedFill);
    }
    else {
      console.log("handleMouseIn: mouseButton is not down");
    }
    // mouseButtonDown && toggleSquare(event);
  };

  // const handleMouseOut = (event) => {
  //   console.log(`handleMouseOut firing on Square ${pixelCount}`, event);
  // };

  

  return (
    <div 
      className={getSquareClassNames(squareData)}
      // onClick={toggleSquare}
      // onContextMenu={toggleSquare}
      onContextMenu={e => e.preventDefault()}
      onMouseDown={toggleSquare}
      // TODO: Uncomment when working on click-and-drag functionality
      onMouseEnter={handleMouseIn}
      // onMouseOver={handleMouseIn}
      // onMouseLeave={handleMouseOut}
      style={{
        backgroundColor: gridViewActive ? undefined : color,
      }}
    >
    </div>
  )
}

function Square ({
  // color = "#FF0000", 
  gridViewActive,
  // isFilled,
  mouseButtonDown,
  parseSquareData,
  puzzleGrid,
  puzzleOpacity = 1,
  puzzleSize,
  // puzzleOpacity = .75,
  rawSquareData,
  togglePuzzleGridSquare,
}) {
  const { color, colorIndex, pixelCount } = (() => {
    // console.log(`parsingSquareData for ${squareData}...`);
    // const timeStarted = Date.now();
    const result = parseSquareData(rawSquareData);
    // const timeElapsed = Date.now() - timeStarted;
    // console.log(`parsedSquareData in ${timeElapsed}`);
    return result;
  })();

  
  // kinda redundant, but a little easier to work with
  const borderColor = BOARD_SQUARE_BORDER_COLOR;
  const containerPadding = BOARD_SQUARE_CONTAINER_PADDING;
  const emptyColor = BOARD_SQUARE_EMPTY_COLOR;
  const fillColor = BOARD_SQUARE_FILL_COLOR;
  const guideColor = BOARD_SQUARE_GUIDELINE_COLOR
  const guideStrokeWidth = BOARD_SQUARE_GUIDELINE_STROKE_WIDTH;
  const strokeWidth = BOARD_SQUARE_STROKE_WIDTH;
  const xColor = BOARD_SQUARE_X_COLOR

  const isFilled = puzzleGrid[pixelCount] === 1;
  const isX = puzzleGrid[pixelCount] === 2;

  // maybe calculate these based on current screen width?
  const squareSize = BOARD_SQUARE_SIZE;
  const borderRadius = BOARD_SQUARE_BORDER_RADIUS;

  const toggleSquare = (e, continuedFill = null) => {
    e.preventDefault();
    console.log("toggleSquare: event:", e);
    console.log("toggleSquare: mouseButtonDown:", mouseButtonDown);
    console.log("toggleSquare: continuedFill:", continuedFill);
    let fillType;

    if (e.button === 0) {
      fillType = "fill";
    }

    if (e.button === 2) {
      fillType = "x";
    }

    if (continuedFill) {
      fillType = continuedFill;
    }

    console.log("toggleSquare: fillType: ", fillType);

    // if (continuedFill) {
    //   fillType = continuedFill;
    // }
    // else {
    //   // left click happened
    //   if (e.button === 0) {
    //     fillType = "fill";
    //   }

    //   // right click happened
    //   else if (e.button === 2) {
    //     fillType = "x";
    //   }
    // }
    
    gridViewActive && togglePuzzleGridSquare(pixelCount, fillType);
  }

  const puzzleSquareColor = isFilled ? fillColor : emptyColor;
  
  const puzzleGridOpacity = gridViewActive ? puzzleOpacity : 0;
  
  // guideline calculations
  const canHaveGuides = puzzleSize.width > 5 && puzzleSize.height > 5;
  
  const columnIndex = pixelCount % puzzleSize.width;
  const rowIndex = Math.floor(pixelCount / puzzleSize.width);

  const hasRightGuideBorder = canHaveGuides && 
    columnIndex !== puzzleSize.width - 1 &&
    columnIndex % 5 === 4;

  const hasBottomGuideBorder = canHaveGuides &&
    rowIndex !== puzzleSize.height - 1 &&
    rowIndex % 5 === 4;


  // TODO: Use these to build click and drag functionality

  const handleMouseIn = (event) => {
    console.log(`handleMouseIn firing on Square ${pixelCount}`, event);

    if (mouseButtonDown === 0 || mouseButtonDown === 2) {
      const continuedFill = mouseButtonDown === 2 ? "x" : "fill";
      console.log("handleMouseIn: mouseButtonDown is set to: ", mouseButtonDown);
      toggleSquare(event, continuedFill);
    }
    else {
      console.log("handleMouseIn: mouseButton is not down");
    }
    // mouseButtonDown && toggleSquare(event);
  };

  // const handleMouseOut = (event) => {
  //   console.log(`handleMouseOut firing on Square ${pixelCount}`, event);
  // };

  return (
    <div 
      className="board-square"
      // onClick={toggleSquare}
      // onContextMenu={toggleSquare}
      onContextMenu={e => e.preventDefault()}
      onMouseDown={toggleSquare}
      // TODO: Uncomment when working on click-and-drag functionality
      onMouseEnter={handleMouseIn}
      // onMouseOver={handleMouseIn}
      // onMouseLeave={handleMouseOut}
    >
      <svg
        height={squareSize + (2 * containerPadding)}
        width={squareSize + (2 * containerPadding)}
      >
        <rect
          className="board-square-rect color-rect"
          height={squareSize}
          width={squareSize}
          rx={borderRadius}
          style={{
            // fill: getSquareColor(),
            fill: color,
            // stroke: borderColor,
            // strokeWidth: strokeWidth, 
          }}
          x={containerPadding}
          y={containerPadding}
        />
        <rect
          className="board-square-rect puzzle-rect"
          height={squareSize}
          width={squareSize}
          rx={borderRadius}
          style={{
            fill: puzzleSquareColor,
            opacity: puzzleGridOpacity,
            // stroke: borderColor,
            // strokeWidth: strokeWidth, 
          }}
          x={containerPadding}
          y={containerPadding}
        />

        {/* top line */}
        <line
          className="board-square-top-border"
          x1={0}
          y1={0}
          x2={squareSize}
          y2={0}
          stroke={borderColor}
          strokeWidth={strokeWidth}
        />

        {/* right line */}
        <line
          className="board-square-right-border"
          x1={squareSize}
          y1={0}
          x2={squareSize}
          y2={squareSize}
          stroke={hasRightGuideBorder ? guideColor : borderColor}
          strokeWidth={hasRightGuideBorder ? guideStrokeWidth : strokeWidth}
        />

        {/* look, here's the bottom line */}
        <line
          className="board-square-bottom-border"
          x1={squareSize}
          y1={squareSize}
          x2={0}
          y2={squareSize}
          stroke={hasBottomGuideBorder ? guideColor : borderColor}
          strokeWidth={hasBottomGuideBorder ? guideStrokeWidth : strokeWidth}
        />

        {/* left line */}
        <line
          className="board-square-left-border"
          x1={0}
          y1={squareSize}
          x2={0}
          y2={0}
          stroke={borderColor}
          strokeWidth={strokeWidth}
        />

        {
          isX && gridViewActive && (
            <>
              {/* X line 1 */}
              <line
                className="board-square-x-line-one"
                x1={4}
                y1={4}
                x2={squareSize - 4}
                y2={squareSize - 4}
                stroke={xColor}
                strokeWidth={guideStrokeWidth}
              />

              {/* X line 2 */}
              <line
                className="board-square-x-line-two"
                x1={4}
                y1={squareSize - 4}
                x2={squareSize - 4}
                y2={4}
                stroke={xColor}
                strokeWidth={guideStrokeWidth}
              />
            </>
          )
        }
      </svg>
    </div>
  )
}

const MemoizedSquare = USE_REDESIGNED_SQUARE ? React.memo(RedesignedSquare) : React.memo(Square);
 
export default Board;