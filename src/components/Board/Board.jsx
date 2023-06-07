import React, { 
  useEffect,
  useState,
} from 'react';

import "./Board.scss";

import {
  BOARD_SQUARE_BORDER_COLOR,
  BOARD_SQUARE_BORDER_RADIUS,
  BOARD_SQUARE_CONTAINER_PADDING,
  BOARD_SQUARE_EMPTY_COLOR,
  BOARD_SQUARE_FILL_COLOR,
  BOARD_SQUARE_SIZE,
  BOARD_SQUARE_STROKE_WIDTH,
  PUZZLE_SQUARE_DELIMITER,
} from "../../constants";

const Board = ({
  gridViewActive,
  puzzleData,
  puzzleGrid,
  puzzleOpacity,
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

  const { colors } = puzzleData;

  // parse the puzzle array from the string
  const puzzle = (() => {
    console.log("Board: building puzzle from puzzleData.puzzle: ", puzzleData.puzzle);
    // for demo examples where the data comes in as an already parsed array
    if (Array.isArray(puzzleData.puzzle)) {
      return puzzleData.puzzle;
    }

    // assuming it has a valid height/width properties
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
  })();


  const puzzleIsValid = () => puzzle && Array.isArray(puzzle) && puzzle.length > 0;

  const parseSquareData = (squareData) => {
    // squareData comes in as "pixelCount:colorIndex";
    const splitSquareData = squareData.split(":");
    
    return ({
      colorIndex: splitSquareData[1],
      color: colors[splitSquareData[1]],
      pixelCount: splitSquareData[0],
    });
  }

  useEffect(() => {
    console.log("Board: puzzleData is:", puzzleData);
    console.log("Board: puzzleGrid is:", puzzleGrid);
  }, []);

  return ( 
    <div 
      className="board board-wrapper"
      onMouseDown={() => setMouseButtonDown(true)}
      onMouseUp={() => setMouseButtonDown(false)}
      onMouseLeave={() => setMouseButtonDown(false)}
    >
      {
        puzzleIsValid() && puzzle.map((rowData, index) => (
          <Row
            gridViewActive={gridViewActive}
            key={`row-${index}`}
            mouseButtonDown={mouseButtonDown}
            parseSquareData={parseSquareData}
            puzzleGrid={puzzleGrid}
            puzzleOpacity={puzzleOpacity}
            rowData={rowData}
            togglePuzzleGridSquare={togglePuzzleGridSquare}
          />
        ))
      }
    </div>
  );
}

function Row ({ 
  // colors,
  gridViewActive,
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
        rowData.map((squareData, index) => (
          // <Square
          <MemoizedSquare
            // color={getColorFromSquareData(squareData)}
            gridViewActive={gridViewActive}
            key={`square-${index}`}
            // isFilled={false}
            mouseButtonDown={mouseButtonDown}
            parseSquareData={parseSquareData}
            puzzleGrid={puzzleGrid}
            puzzleOpacity={puzzleOpacity}
            squareData={squareData}
            togglePuzzleGridSquare={togglePuzzleGridSquare}
          />
        ))
      }
    </div>
  );
}

function Square ({
  // color = "#FF0000", 
  gridViewActive,
  // isFilled,
  mouseButtonDown,
  parseSquareData,
  puzzleGrid,
  puzzleOpacity = .75,
  squareData,
  togglePuzzleGridSquare,
}) {
  const { color, colorIndex, pixelCount } = (() => {
    // console.log(`parsingSquareData for ${squareData}...`);
    // const timeStarted = Date.now();
    const result = parseSquareData(squareData);
    // const timeElapsed = Date.now() - timeStarted;
    // console.log(`parsedSquareData in ${timeElapsed}`);
    return result;
  })();

  // kinda redundant, but a little easier to work with
  const borderColor = BOARD_SQUARE_BORDER_COLOR;
  const containerPadding = BOARD_SQUARE_CONTAINER_PADDING;
  const emptyColor = BOARD_SQUARE_EMPTY_COLOR;
  const fillColor = BOARD_SQUARE_FILL_COLOR;
  const strokeWidth = BOARD_SQUARE_STROKE_WIDTH;

  const isFilled = puzzleGrid[pixelCount] === 1;

  // maybe calculate these based on current screen width?
  const squareSize = BOARD_SQUARE_SIZE;
  const borderRadius = BOARD_SQUARE_BORDER_RADIUS;

  const toggleSquare = () => gridViewActive && togglePuzzleGridSquare(pixelCount);

  const puzzleSquareColor = isFilled ? fillColor : emptyColor;

  const puzzleGridOpacity = gridViewActive ? puzzleOpacity : 0;


  // TODO: Use these to build click and drag functionality

  // const handleMouseIn = (event) => {
  //   console.log(`handleMouseIn firing on Square ${pixelCount}`, event);
  //   mouseButtonDown && toggleSquare();
  // };

  // const handleMouseOut = (event) => {
  //   console.log(`handleMouseOut firing on Square ${pixelCount}`, event);
  // };

  return (
    <div 
      className="board-square"
      // onClick={toggleSquare}
      // onMouseDown={toggleSquare}
      // TODO: Uncomment when working on click-and-drag functionality
      // onMouseEnter={handleMouseIn}
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
            stroke: borderColor,
            strokeWidth: strokeWidth, 
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
      </svg>
    </div>
  )
}

const MemoizedSquare = React.memo(Square);
 
export default Board;