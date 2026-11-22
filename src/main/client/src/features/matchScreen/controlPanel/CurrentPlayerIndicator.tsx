import { useCallback } from "react";
import Canvas from "../../../components/common/canvas/canvas";
import { tankColor, tankDimensions } from "../../../constants";
import type { Player } from "../../../types";
import { toDisplayedTurretAngle } from "./turretAngle";
import { drawTank } from "../battleDisplay/tanks/tankDrawing";

const INDICATOR_SIZE = 100;
const TANK_DRAWING_FACTOR = 2;
const INDICATOR_TURRET_ANGLE = -45;

type CurrentPlayerIndicatorProps = {
  currentPlayer: Player;
  isOwnTurn: boolean;
  /** Show what the current player is aiming at; false while a replay is running or the match is not live. */
  showLiveAim?: boolean;
};

const describeAim = ({ name, tank }: Player): string =>
  tank.selectedAction === "DRIVE"
    ? `${name} is getting ready to drive`
    : `${name} is aiming: ${toDisplayedTurretAngle(tank.turretAngle)}\u00B0, ${tank.shotPower}% power`;

/** A large drawing of the tank whose turn it is, and whose turn that is. */
const CurrentPlayerIndicator = ({
  currentPlayer,
  isOwnTurn,
  showLiveAim = false,
}: CurrentPlayerIndicatorProps) => {
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
      {showLiveAim && !isOwnTurn && <p className="aim-readout">{describeAim(currentPlayer)}</p>}
    </div>
  );
};

export default CurrentPlayerIndicator;
