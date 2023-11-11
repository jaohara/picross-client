import React, { 
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import "./Board.scss";

import {
  BOARD_SQUARE_SIZE,
  PUZZLE_SQUARE_DELIMITER,
} from "../../constants";

const Board = ({
  // gridViewActive,
  puzzleData,
  puzzleGrid,
  puzzleOpacity,
  puzzleIsSolved,
  togglePuzzleGridSquare,
}) => {
  // TODO: cleanup after board event delegation is finished
  // const [ mouseButtonDown, setMouseButtonDown ] = useState(false);
  const isMouseDown = useRef(false);
  const initialFillAction = useRef(false);
  const toggledSquareBatch = useRef([]);

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
    board-square
    ${gridViewActive && squareData.isFilled ? "filled" : ""}
    ${gridViewActive && !squareData.isFilled && squareData.isX ? "x" : ""}
    ${gridViewActive && squareData.hasLeftBorder ? "border-left" : ""}
    ${gridViewActive && squareData.hasTopBorder ? "border-top" : ""}
    ${gridViewActive && squareData.hasBottomGuideBorder ? "guide-border-bottom" : ""}
    ${gridViewActive && squareData.hasRightGuideBorder ? "guide-border-right" : ""}
    ${squareData.hasBottomLeftBorderRadius ? "border-radius-bottom-left" : ""}
    ${squareData.hasBottomRightBorderRadius ? "border-radius-bottom-right" : ""}
    ${squareData.hasTopLeftBorderRadius ? "border-radius-top-left" : ""}
    ${squareData.hasTopRightBorderRadius ? "border-radius-top-right" : ""}
    ${!gridViewActive ? "completed" : ""}
  `;

  useEffect(() => {
    console.log("Board: puzzleData is:", puzzleData);
    console.log("Board: puzzleGrid is:", puzzleGrid);
  }, []);

  // TODO: cleanup after board event delegation is finished
  // this was the old way of indicating a button hold
  const handleSettingMouseButtonDown = (e) => {
    if (mouseButtonDown) {
      console.log("handleSettingMouseButtonDown: already set, aborting");
      return;
    }

    e.preventDefault();

    console.log("handleSettingMouseButtonDown: e.button:", e.button);

    setMouseButtonDown(e.button);
  }

  const handleMouseDown = (e) => {
    e.preventDefault();

    if (e.target.matches(".board-square")) {
      mouseButtonDown.current = true;
      toggledSquareBatch.current = [];
      // assumes ids are like "board-square-x", where x is pixelCount
      const pixelCount = e.target.id.split("-")[2];
      // next, determine action type based on initial square fill
      let fillType;


    }
  };

  const handleMouseUp = (e) => {
    mouseButtonDown.current = false;
  };

  const handleMouseEnter = (e) => {
    if (e.buttons === 0) {
      mouseButtonDown.current = false;
    }
  }

  // TODO: Define logic for different square sizes here
  // TODO: Account for resolution - laptop can't display all squares in 15x15 or larger
  const boardWrapperClassNames = `
    board-wrapper
    ${ puzzleSize.width > 15 ? "small-squares" : "" }
    ${ puzzleSize.width < 10 ? "large-squares" : "" }
    ${ puzzleIsSolved ? "completed" : "in-progress" }
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
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          // TODO: cleanup after board event delegation is finished
          // onMouseDown={handleSettingMouseButtonDown}
          onContextMenu={handleMouseDown}
          // TODO: cleanup after board event delegation is finished
          // onContextMenu={handleSettingMouseButtonDown}
          // TODO: cleanup after board event delegation is finished
          // onMouseUp={() => setMouseButtonDown(false)}
          onMouseUp={handleMouseUp}
          // TODO: Do I want this behavior? Does this avoid mouseUp never triggering?
          // onMouseLeave={() => setMouseButtonDown(false)}
        >
          {
            puzzleIsValid && puzzle.map((rowData, index) => (
              <Row
                getSquareClassNames={getSquareClassNames}
                gridViewActive={gridViewActive}
                key={`row-${index}`}
                // mouseButtonDown={mouseButtonDown}
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
  // mouseButtonDown,
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
            // mouseButtonDown={mouseButtonDown}
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

function Square ({
  // color = "#FF0000",
  getSquareClassNames, 
  gridViewActive,
  // isFilled,
  // mouseButtonDown,
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
    //TODO: Prune these leftover logs
    // console.log("toggleSquare: event:", e);
    // console.log("toggleSquare: mouseButtonDown:", mouseButtonDown);
    // console.log("toggleSquare: continuedFill:", continuedFill);
    let fillType;

    if (e.button === 0) {
      fillType = e.ctrlKey ? "x" : "fill";
    }

    if (e.button === 2) {
      fillType = "x";
    }
    
    if (continuedFill) {
      fillType = continuedFill;
    }
    
    //TODO: Prune these leftover logs
    // console.log("toggleSquare: fillType: ", fillType);
    
    gridViewActive && togglePuzzleGridSquare(pixelCount, fillType);
  };

  // TODO: Use these to build click and drag functionality

  const handleMouseIn = (event) => {
    // console.log(`handleMouseIn firing on Square ${pixelCount}`, event);

    if (mouseButtonDown === 0 || mouseButtonDown === 2) {
      const continuedFill = (() => {
        if (mouseButtonDown === 2) {
          return "x"
        } 
        
        return event.ctrlKey ? "x" : "fill";
      })();
      // console.log("handleMouseIn: mouseButtonDown is set to: ", mouseButtonDown);
      toggleSquare(event, continuedFill);
    }
    //TODO: Prune these leftover logs
    // else {
    //   console.log("handleMouseIn: mouseButton is not down");
    // }
    // mouseButtonDown && toggleSquare(event);
  };  

  return (
    <div 
      className={getSquareClassNames(squareData)}
      // onClick={toggleSquare}
      // onContextMenu={toggleSquare}
      id={`board-square-${pixelCount}`}
      key={`board-square-${pixelCount}`}
      onContextMenu={e => e.preventDefault()}
      onMouseDown={toggleSquare}
      // TODO: Uncomment when working on click-and-drag functionality
      onMouseEnter={handleMouseIn}
      // onMouseOver={handleMouseIn}
      style={{
        backgroundColor: gridViewActive ? undefined : color,
      }}
    >
    </div>
  )
}

const MemoizedSquare = React.memo(Square);
 
export default Board;