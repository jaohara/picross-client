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
  rowAndColumnSums,
  togglePuzzleGridSquare,
}) => {
  // TODO: cleanup after board event delegation is finished
  // const [ mouseButtonDown, setMouseButtonDown ] = useState(false);
  const mouseButtonDown = useRef(false);
  const clickAction = useRef(null);
  // Used to prevent moves from being logged multiple times in a given "run" (click and drag)
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

  // const {
  //   rows: rowSums,
  //   cols: colSums,
  // } = rowAndColumnSums;

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
   * Checks whether a square at a given pixelCount is in the current move batch.
   * @param {number|string} pixelCount the pixel id of the grid to check the index of
   * @returns {number} the index of the square in the batch ref array, -1 if it doesn't exist
   */
  const getIndexOfSquareInBatch = (pixelCount) => toggledSquareBatch.current.indexOf(pixelCount);

  /**
   * Checks whether a square at a given pixelCount is in the current move batch.
   * @param {number|string} pixelCount the pixel id of the square to check
   * @returns {boolean} whether the square is in the current batch
   */
  const isSquareInBatch = (pixelCount) => getIndexOfSquareInBatch(pixelCount) !== -1;

  /**
   * A function to toggle whether a square is in the batch via its pixelCount index 
   * @param {any} pixelCount the number of the square in the grid to toggle (string or number?) 
   * @returns true when a square is toggled on, false when a square is toggled off
   */
  const toggleSquareInBatch = (pixelCount) => {
    // TODO: not sure if I actually need this


    const index = getIndexOfSquareInBatch(pixelCount);

    // doesn't exist, add to batch
    if (index === -1) {
      // mutating a ref array like this rather than reassigning is fine, even if it seems strange
      addSquareToBatch(pixelCount);
      return true;
    }

    // it exists, so remove from batch
    removeSquareFromBatchAtIndex(index, 1);
    return false;
  };

  // adds a square's pixelCount to the batch
  const addSquareToBatch = (pixelCount) => toggledSquareBatch.current.push(pixelCount);

  // removes a square's pixelCount from the batch at a given index
  const removeSquareFromBatchAtIndex = (batchIndex) => 
    toggledSquareBatch.current.splice(batchIndex, 1); 

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

    const squareStatus = puzzleGrid[pixelCount];

    if (squareStatus > maxValidSquareStatusCode) {
      console.error(`getCurrentSquareStatus: '${squareStatus}' is not a valid square status code.`);
      return null;
    }

    return squareStatusCodes[squareStatus];
  }

  /**
   * Applies the provided clickAction to the square at the given pixelCount and adds 
   * the pixelCount to the current toggledSquareBatch. To be triggered after a click is 
   * processed or on enter in the case of a click-and-drag-event.
   * @param {string} clickAction clickAction string (from clickActions in squareUtils)
   * @param {string|number} pixelCount index of the square in the puzzleGrid
   * @returns {boolean} whether the action was successfully applied
   */
  function applyActionToSquare (clickAction, pixelCount) {
    if (!clickAction) {
      return false;
    }

    // check to see if it exists in batch
    if (isSquareInBatch(pixelCount)) {
      // we've already done a move on this square, so bail out early
      return false;
    }

    // toggle behavior (via "toggleSquareInBatch") would allow a user to go backwards over
    //  drawn squares in a click-and-drag move to undo the move. I don't think I want or need
    //  this functionality, so I will just add the squares manually, but I'll keep the functions
    //  around.
    // toggleSquareInBatch(pixelCount);

    addSquareToBatch(pixelCount);
    togglePuzzleGridSquare(pixelCount, clickAction);
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
    e.preventDefault();
    e.stopPropagation();
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

  // TODO: Account for resolution - laptop can't display all squares in 15x15 or larger
  //  - maybe handle these with media queries in the SCSS?
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

  const colSums = rowAndColumnSums ? rowAndColumnSums?.cols : null;
  const rowSums = rowAndColumnSums ? rowAndColumnSums?.rows : null;

  return ( 
    <div className={boardWrapperClassNames}>
      <ColumnNumbers 
        colNumbers={parsedColNumbers}
        // colSums={colSums}
        colSums={rowAndColumnSums?.cols}
      />

      <div className="board-row-and-board-wrapper">
        <RowNumbers
          rowNumbers={parsedRowNumbers}
          // rowSums={rowSums}
          rowSums={rowAndColumnSums?.rows}
        />

        <div 
          className="board"
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          // TODO: this doesn't do anything, but only remove after you're certain.
          // onContextMenuDown={handleMouseDown} 
          onContextMenu={(e) => e.preventDefault()} // smother right click menu
          onMouseUp={handleMouseUp}
        >
          {
            puzzleIsValid && puzzle.map((rowData, index) => (
              <Row
                getSquareClassNames={getSquareClassNames}
                gridViewActive={gridViewActive}
                handleMouseDown={handleMouseDown}
                handleSquareMouseEnter={handleSquareMouseEnter}
                key={`row-${index}`}
                mouseRefs={mouseRefs}
                parseSquareData={parseSquareData}
                puzzleGrid={puzzleGrid}
                puzzleOpacity={puzzleOpacity}
                puzzleSize={puzzleSize}
                rowData={rowData}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

// TODO: What was my intent with this? I think I wrote it while working on `buildNumberElements`
const getClassIfRowOrColSumMatches = (number, sums, groupIndex, numberIndex, id = undefined) => {
  if (!number || !sums || !groupIndex || !numberIndex) return "";

  const sum = sums[groupIndex][numberIndex];

  console.log(`getClassIfRowOrColSumMatches: '${id}' - matching sum '${sum}'`)

  if (!sum) return "";
  
  // id && console.log(`id: ${id}`);
  // console.log("sums array: ", sums);
  // console.log(`lookup at sums[${groupIndex}][${numberIndex}]`);
  console.log(`Comparing ${number} to ${sum}`);
  
  if (number === sum) {
    console.log(`getClassIfRowOrColSumMatches: ${id} is completed`);
    return "completed";
  }
};

/**
 * Builds JSX elements for RowNumbers and ColNumbers
 * @param {any} numbers the array of row or column numbers
 * @param {any} sums the current row or column sums 
 * @param {"row"|"col"} axisType whether you're building numbers for the rows or columns
 * @returns Array of JSX elements to render
 */
function buildNumberElements(numbers, sums, axisType = "col") {
  // console.log("buildNumberElements: building number elements with numbers, sums:", numbers, sums);

  return numbers.map((numberGroup, groupIndex) => (
    <div 
      className={`board-number-container ${!sums ? `no-${axisType}-sums` : ""}`}
      id={`${axisType}-group-${groupIndex}`}
      key={`${axisType}-group-${groupIndex}`}
    >
      {
        numberGroup.map((number, numberIndex) => {
          let classString = "";
          
          if (sums) {
            const sumGroup = sums[groupIndex];

            if (sumGroup) {
              const sum = sumGroup[numberIndex]
              // console.log(`buildNumberElements: number: ${number}, sum: ${sum}`);
  
              if (sum === number && sums[groupIndex].length <= numberGroup.length) {
                classString += "completed"
              }
            }
          }

          return (
            <div 
              className={`board-number ${classString}`}
              id={`${axisType}-number-${groupIndex}-${numberIndex}`}
              key={`${axisType}-number-${groupIndex}-${numberIndex}`}
            >
              {number}
            </div>
          )
        })
      }
    </div>
  ));
};

// TODO: a lot of code reuse here, find a way to combine this and RowNumbers
function ColumnNumbers ({
  colNumbers,
  colSums,
}) {
  const [ numberElements, setNumberElements ] = useState([]);

  useEffect(() => {
    // console.log(`ColumnNumbers: colNumbers:`, colNumbers);
    // console.log(`ColumnNumbers: colSums:`, colSums);
    setNumberElements(buildNumberElements(colNumbers, colSums, "col"));
  }, [colNumbers, colSums]);

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
  rowSums,
}) {
  const [ numberElements, setNumberElements ] = useState([]);

  useEffect(() => {
    setNumberElements(buildNumberElements(rowNumbers, rowSums, "row"));
  }, [rowNumbers, rowSums]);

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