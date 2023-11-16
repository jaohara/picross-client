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

import {
  getNewSquareStatus,
  getPixelCountFromDOMId,
  maxValidSquareStatusCode,
  squareStatusCodes,
} from "../../utils/squareUtils";

const getPixelCountFromMouseEvent = (e) => getPixelCountFromDOMId(e.target.id);

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
  const mouseButtonDown = useRef(false);
  const clickAction = useRef(null);
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

  /**
   * A function to toggle whether a square is in the batch via its pixelCount index 
   * @param {any} pixelCount the number of the square in the grid to toggle (string or number?) 
   * @returns true when a square is toggled on, false when a square is toggled off
   */
  const toggleSquareInBatch = (pixelCount) => {
    const index = toggledSquareBatch.current.indexOf(pixelCount);

    if (index === -1) {
      // mutating a ref array like this rather than reassigning is fine, even if it seems strange
      toggledSquareBatch.current.push(pixelCount);
      return true;
    }

    toggledSquareBatch.current.splice(index, 1);
    return false;
  }

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

  /**
   * Gets the current status of the square in the puzzleGrid at a given pixelCount index.
   * @param {any} pixelCount the number of the square in the grid to toggle (string or number?) 
   * @returns {string|null} the parsed square status string ("empty", etc.) or null on failure
   */
  // TODO: use this to determine the newClickAction in handleMouseDown
  const getCurrentSquareStatus = (pixelCount) => {
    if (pixelCount > puzzleGrid.length) {
      // shouldn't happen, but it would be bad if it did
      console.error(`getCurrentSquareStatus: index '${pixelCount}' outside bounds of puzzleGrid (> ${puzzleGrid.length})`);
      return null;
    }

    console.log(`getCurrentSquareStatus: puzzleGrid before:`, puzzleGrid);
    const squareStatus = puzzleGrid[pixelCount];

    console.log(`getCurrentSquareStatus: ${pixelCount} is '${squareStatus}'`);
    console.log(`getCurrentSquareStatus: puzzleGrid after:`, puzzleGrid);


    if (squareStatus > maxValidSquareStatusCode) {
      console.error(`getCurrentSquareStatus: '${squareStatus}' is not a valid square status code.`);
      return null;
    }

    return squareStatusCodes[squareStatus];
  }

  // applies the current status of initialClickAction.current
  //  - this is triggered after a click is processed or on enter in the case of a
  //    click-and-drag event
  /**
   * Applies the provided clickAction to the square at the given pixelCount and adds 
   * the pixelCount to the current toggledSquareBatch.
   * @param {string} clickAction clickAction string (from clickActions in squareUtils)
   * @param {string|number} pixelCount index of the square in the puzzleGrid
   * @returns {boolean} whether the action was successfully applied
   */
  function applyActionToSquare (clickAction, pixelCount) {
    if (!clickAction) {
      return false;
    }

    togglePuzzleGridSquare(pixelCount, clickAction);
    toggleSquareInBatch(pixelCount);
    return true;
  }

  // helper function to reset the relevant refs after a mouse action
  const resetMouseRefs = () => {
    clickAction.current = null;
    mouseButtonDown.current = false;
    toggledSquareBatch.current = [];
  }

  // This handles the logic for clicking on a square
  const handleMouseDown = (e) => {
    console.log("handleMouseDown: puzzleGrid at start:", puzzleGrid);
    e.preventDefault();
    resetMouseRefs();

    if (e.target.matches(".board-square")) {
      mouseButtonDown.current = true;
      const pixelCount = getPixelCountFromMouseEvent(e);
      const currentSquareStatus = getCurrentSquareStatus(pixelCount);
      let newClickAction;
      
      // some boolean flags
      const squareIsFilled = currentSquareStatus === "fill";
      const squareIsEmpty = currentSquareStatus === "empty";
      const squareIsX = currentSquareStatus === "x";
      const ctrlKey = e.ctrlKey;
      const leftClick = e.button === 0 && !ctrlKey;
      const rightClick = e.button === 2 || (e.button === 0 && ctrlKey);
      
      // fill an empty square
      if (leftClick && squareIsEmpty) {
        // console.log("handleMouseDown: fill an empty path");
        newClickAction = "fill";
      }
      // empty a filled square
      else if (leftClick && squareIsFilled) {
        // console.log("handleMouseDown: empty a fill path");
        newClickAction = "empty-fill";
      }
      // x an empty square
      else if (rightClick && squareIsEmpty) {
        // console.log("handleMouseDown: x an empty path");
        newClickAction = "x";
      }
      // empty an x'd square
      else if (rightClick && squareIsX) {
        // console.log("handleMouseDown: empty an x path");
        newClickAction = "empty-x";
      }

      // TODO: prune these logs
      const LONG_DEBUG_LOGS = false;

      if (LONG_DEBUG_LOGS) {
        console.log(`handleMouseDown: e.button: ${e.button}`);
        console.log(`handleMouseDown: pixelCount: ${pixelCount}`);
        console.log(`handleMouseDown: ctrlKey: ${ctrlKey}`);
        console.log(`handleMouseDown: leftClick: ${leftClick}`);
        console.log(`handleMouseDown: rightClick: ${rightClick}`);
        console.log(`handleMouseDown: currentSquareStatus: ${currentSquareStatus}`);
        console.log(`handleMouseDown: newClickAction: ${newClickAction}`);
      }

      // set clickAction.current to remember for mouse over events
      clickAction.current = newClickAction;
      applyActionToSquare(newClickAction, pixelCount);
    }
  };

  const handleMouseUp = (e) => {
    // mouseButtonDown.current = false;
    resetMouseRefs();
  };

  const handleMouseEnter = (e) => {
    if (e.buttons === 0) {
      // mouseButtonDown.current = false;
      resetMouseRefs();
    }
  };

  function handleSquareMouseEnter (e, mouseRefs) {
    // TODO: prune log code
    const DEBUG_LOGS = false;

    if (!mouseRefs) {
      DEBUG_LOGS && console.error("handleSquareMouseEnter: no mouseRefs provided, aborting");
      return;
    }

    const { mouseButtonDownRef, clickActionRef } = mouseRefs;

    // TODO: prune log code
    if (DEBUG_LOGS) {
      console.log(`handleMouseSquareEnter: mouseButtonDownRef.current: ${mouseButtonDownRef.current}`);
      console.log(`handleMouseSquareEnter: clickActionRef.current: ${clickActionRef.current}`);
    }

    console.log("handleSquareMouseEnter firing");
    // logic for entering a square
    if (!mouseButtonDownRef?.current || !clickActionRef.current) {
      // no mouse button held, exit
      // console.log("handleSquareMouseEnter: no button held or saved action, aborting");
      return;
    }

    const clickAction = clickActionRef.current;
    const pixelCount = getPixelCountFromMouseEvent(e);

    // TODO: prune log code
    if (DEBUG_LOGS) {
      console.log(`handleSquareMouseEnter: clickAction: ${clickAction}`);
      console.log(`handleSquareMouseEnter: pixelCount: ${pixelCount}`);
    }

    applyActionToSquare(clickAction, pixelCount);
  }

  // TODO: Define logic for different square sizes here
  // TODO: Account for resolution - laptop can't display all squares in 15x15 or larger
  const boardWrapperClassNames = `
    board-wrapper
    ${ puzzleSize.width > 15 ? "small-squares" : "" }
    ${ puzzleSize.width < 10 ? "large-squares" : "" }
    ${ puzzleIsSolved ? "completed" : "in-progress" }
  `;

  // initial load useEffect
  useEffect(() => {
    console.log("Board: puzzleData is:", puzzleData);
    console.log("Board: puzzleGrid is:", puzzleGrid);
  }, []);

  // omitting toggledSquareBatch - what am I using this for?
  const mouseRefs = { 
    clickActionRef: clickAction, 
    mouseButtonDownRef: mouseButtonDown,
  };

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
          onContextMenuDown={handleMouseDown} // only fire on down, not up
          onContextMenu={(e) => e.preventDefault()} // smother right click menu
          onMouseUp={handleMouseUp}
          // TODO: Do I want this behavior? Does this avoid mouseUp never triggering?
          // onMouseLeave={() => setMouseButtonDown(false)}
        >
          {
            puzzleIsValid && puzzle.map((rowData, index) => (
              <Row
                getSquareClassNames={getSquareClassNames}
                gridViewActive={gridViewActive}
                handleMouseDown={handleMouseDown}
                handleSquareMouseEnter={handleSquareMouseEnter}
                key={`row-${index}`}
                // mouseButtonDown={mouseButtonDown}
                mouseRefs={mouseRefs}
                parseSquareData={parseSquareData}
                puzzleGrid={puzzleGrid}
                puzzleOpacity={puzzleOpacity}
                puzzleSize={puzzleSize}
                rowData={rowData}
                // toggleSquare={togglePuzzleGridSquare}
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
  handleSquareMouseEnter,
  mouseRefs,
  puzzleSize,
  // mouseButtonDown,
  parseSquareData,
  puzzleGrid,
  puzzleOpacity,
  rowData,
  // toggleSquare,
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
            handleSquareMouseEnter={handleSquareMouseEnter}
            key={`square-${index}`}
            // isFilled={false}
            // mouseButtonDown={mouseButtonDown}
            mouseRefs={mouseRefs}
            parseSquareData={parseSquareData}
            puzzleGrid={puzzleGrid}
            puzzleOpacity={puzzleOpacity}
            puzzleSize={puzzleSize}
            rawSquareData={rawSquareData}
            // toggleSquare={toggleSquare}
          />
        ))
      }
    </div>
  );
}

function Square ({
  getSquareClassNames, 
  gridViewActive,
  handleSquareMouseEnter,
  mouseRefs,
  parseSquareData,
  puzzleGrid,
  puzzleOpacity = 1,
  puzzleSize,
  // puzzleOpacity = .75,
  rawSquareData,
  // toggleSquare,
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
  };

  const handleMouseEnter = (e) => handleSquareMouseEnter(e, mouseRefs);

  return (
    <div 
      className={getSquareClassNames(squareData)}
      // onClick={toggleSquare}
      // onContextMenu={toggleSquare}
      id={`board-square-${pixelCount}`}
      key={`board-square-${pixelCount}`}
      // onContextMenu={e => e.preventDefault()}
      // onMouseDown={originalToggleSquare}
      // onMouseDown={toggleSquare}
      // TODO: Uncomment when working on click-and-drag functionality
      onMouseEnter={handleMouseEnter}
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