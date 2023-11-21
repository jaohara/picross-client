import React, {
  useEffect,
  useRef,
} from 'react';

import './PuzzleIcon.scss';

import { TbQuestionMark } from "react-icons/tb";

import { LARGE_ICON_SIZE } from '../../constants';

const PuzzleIcon = ({
  className,
  // maybe not necessary - used to scale canvas and draw operations
  imageScale = 1.0, 
  puzzleData,
  revealed = true,
 }) => {
  // use canvas with ref to it
  const canvasRef = useRef(null);

  useEffect(() => {
    const generateImage = () => {
      const canvas = canvasRef.current;
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
      
      puzzleCellColors.forEach((cellColor, index) => {
        // set color
        ctx.fillStyle = colors[cellColor];
        const squareSize = 1 * imageScale;
        const xPos = (index % width) * imageScale;
        const yPos = Math.floor(index / height) * imageScale;
        ctx.fillRect(xPos, yPos, squareSize, squareSize);
      });
    };

    generateImage();
  }, []);

  return ( 
    <div className={`${className} puzzle-icon`}>
      <div className="icon-wrapper">
        {
          revealed ? (
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
