import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import './PuzzleIcon.scss';

import convertMoveListToGrid from '../../utils/convertMoveListToGrid';

import { DataContext } from '../../contexts/DataContext';
import { UserContext } from '../../contexts/UserContext';

import { TbQuestionMark } from "react-icons/tb";

import { 
  BOARD_SQUARE_EMPTY_COLOR,
  BOARD_SQUARE_FILL_COLOR,
  LARGE_ICON_SIZE,
} from '../../constants';

const PuzzleIcon = ({
  className,
  // maybe not necessary - used to scale canvas and draw operations
  imageScale = 1.0,
  // inProgressMoveList = null,
  // inProgressGrid = null,
  // new approach using contexts just the puzzle id - assumes id is valid
  puzzleId,
  // whether the revealed 
  revealedTakesPrecedence = false,
 }) => {
  // use canvas with ref to it
  const canvasRef = useRef(null);

  const { puzzles } = useContext(DataContext);

  // will be undefined if it doesn't exist
  const puzzleData = puzzles.find((puzzle) => puzzle.id === puzzleId);

  const { 
    completedPuzzleIds,
    getIncompletePuzzleGridFromPuzzleData,
    inProgressPuzzleIds,
  } = useContext(UserContext);

  const checkIfPuzzleIsCompleteById = (puzzleId) => completedPuzzleIds.includes(puzzleId);
  const checkIfPuzzleIsInProgressById = (puzzleId) => inProgressPuzzleIds.includes(puzzleId);

  const revealed = checkIfPuzzleIsCompleteById(puzzleId);
  const inProgress = checkIfPuzzleIsInProgressById(puzzleId);

  const inProgressGrid = inProgress ? getIncompletePuzzleGridFromPuzzleData(puzzleData) : null;

  useEffect(() => {
    const generateImage = () => {
      const canvas = canvasRef.current;

      if (!puzzleData) {
        console.error("PuzzleIcon: generateImage: puzzleData does not exist");
        return;
      }

      const { colors, height, width } = puzzleData;

      if (!canvas) {
        // console.log("PuzzleIcon: useEffect: cannot find canvas, aborting");
        return;
      }

      if (!colors || !height || !width) {
        // console.error("PuzzleIcon: useEffect: invalid puzzleData");
        return;
      }

      canvas.height = height * imageScale;
      canvas.width = width * imageScale;
      const ctx = canvas.getContext("2d");
      
      // condense this to one chunky op
      const puzzleCellColors = puzzleData.puzzle.split(",").map((cell) => cell.split(":")[1]);
      
      // turn off smoothing to ensure pixel-perfect rendering
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
      ctx.imageSmoothingQuality = 'high';
      
      puzzleCellColors.forEach((cellColor, pixelCount) => {
        const squareSize = 1 * imageScale;
        const xPos = (pixelCount % height) * imageScale;
        const yPos = Math.floor(pixelCount / width) * imageScale;

        // if in progress, don't draw color, but draw either fill or empty state
        if (inProgress && inProgressGrid && (!revealed || !revealedTakesPrecedence)) {
          const isFill = inProgressGrid[pixelCount] === 1;
          ctx.fillStyle = isFill ? BOARD_SQUARE_FILL_COLOR : BOARD_SQUARE_EMPTY_COLOR;
        }
        else {
          // draw color square for complete puzzle
          // set color
          ctx.fillStyle = colors[cellColor];
        }
        
        ctx.fillRect(xPos, yPos, squareSize, squareSize);
      });
    };

    generateImage();
  }, [puzzleData, inProgressPuzzleIds]);

  const showCanvas = revealed || (inProgress && inProgressGrid);

  return ( 
    <div className={`${className} puzzle-icon`}>
      <div className="icon-wrapper">
        {
          showCanvas ? (
            <canvas id="icon-canvas" ref={canvasRef}></canvas>
          ) : (
            <TbQuestionMark size={LARGE_ICON_SIZE} />
          )
        }
      </div>
    </div>
  );
};
 
export default PuzzleIcon;
