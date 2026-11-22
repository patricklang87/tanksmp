import { useCallback } from "react";
import Canvas from "../../../components/common/canvas/canvas";
import { tankColor, tankDimensions } from "../../../constants";
import type { Player } from "../../../types";
import { drawTank } from "../battleDisplay/tanks/tankDrawing";

const INDICATOR_SIZE = 100;
const TANK_DRAWING_FACTOR = 2;
const INDICATOR_TURRET_ANGLE = -45;

type CurrentPlayerIndicatorProps = {
  currentPlayer: Player;
  isOwnTurn: boolean;
};

/** A large drawing of the tank whose turn it is, and whose turn that is. */
const CurrentPlayerIndicator = ({ currentPlayer, isOwnTurn }: CurrentPlayerIndicatorProps) => {
  const color = tankColor[currentPlayer.tank.colorIndex];
  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      context.clearRect(0, 0, INDICATOR_SIZE, INDICATOR_SIZE);
      drawTank(
        context,
        {
          position: {
            x: (INDICATOR_SIZE - tankDimensions.width * TANK_DRAWING_FACTOR) / 2,
            y: INDICATOR_SIZE / 2,
          },
          color,
          shields: 100,
          turretAngle: INDICATOR_TURRET_ANGLE,
        },
        TANK_DRAWING_FACTOR
      );
    },
    [color]
  );

  return (
    <div className="current-player-indicator">
      <Canvas
        draw={draw}
        label={`${currentPlayer.name}'s tank`}
        className="indicator-canvas"
        width={INDICATOR_SIZE}
        height={INDICATOR_SIZE}
      />
      <p className="turn-message">
        {isOwnTurn ? "Your turn" : `Waiting for ${currentPlayer.name}`}
      </p>
    </div>
  );
};

export default CurrentPlayerIndicator;
