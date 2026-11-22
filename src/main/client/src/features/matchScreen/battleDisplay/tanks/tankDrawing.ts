import { canvasConstants, tankDimensions, designConstants } from "../../../../constants";
import type { Point2D } from "../../../../types";
import { arrayToRgba } from "../../../../util/color";
import { getCoordinatesOnCircle } from "../../../../util/geometry";

export type TankSprite = {
  /** Top-left corner of the tank body. */
  position: Point2D;
  color: number[];
  shields: number;
  turretAngle: number;
};

/** The top-left corner of a tank whose bottom-center rests on `groundPoint`. */
export const centerTank = (groundPoint: Point2D): Point2D => ({
  x: groundPoint.x - tankDimensions.width / 2,
  y: groundPoint.y - tankDimensions.height,
});

/** The bottom-center of a tank whose top-left corner is at `topLeftPoint`; the inverse of centerTank. */
export const uncenterTank = (topLeftPoint: Point2D): Point2D => ({
  x: topLeftPoint.x + tankDimensions.width / 2,
  y: topLeftPoint.y + tankDimensions.height,
});

export const calculateTurretEndpoints = ({
  tankPosition,
  turretAngle,
  factor = 1,
}: {
  tankPosition: Point2D;
  turretAngle: number;
  factor?: number;
}): { startingPoint: Point2D; endingPoint: Point2D } => {
  const startingPoint = {
    x: tankPosition.x + (tankDimensions.width * factor) / 2,
    y: tankPosition.y,
  };
  const endingPoint = getCoordinatesOnCircle({
    center: startingPoint,
    radius: tankDimensions.turretLength * factor,
    angle: turretAngle,
  });
  return { startingPoint, endingPoint };
};

export const drawTank = (
  context: CanvasRenderingContext2D,
  { position, color, shields, turretAngle }: TankSprite,
  factor = 1
): void => {
  const fillColor = arrayToRgba(shields > 0 ? color : designConstants.destroyedTankColor);
  context.fillStyle = fillColor;
  context.fillRect(
    position.x,
    position.y,
    tankDimensions.width * factor,
    tankDimensions.height * factor
  );

  context.beginPath();
  context.arc(
    position.x + (tankDimensions.width * factor) / 2,
    position.y,
    (tankDimensions.height * factor) / 2,
    0,
    2 * Math.PI
  );
  context.fill();

  const { startingPoint, endingPoint } = calculateTurretEndpoints({
    tankPosition: position,
    turretAngle,
    factor,
  });
  context.beginPath();
  context.moveTo(startingPoint.x, startingPoint.y);
  context.lineTo(endingPoint.x, endingPoint.y);
  context.strokeStyle = fillColor;
  context.lineWidth = 3 * factor;
  context.stroke();
  context.closePath();
};

export const drawTanks = (context: CanvasRenderingContext2D, tankSprites: TankSprite[]): void => {
  context.clearRect(0, 0, canvasConstants.width, canvasConstants.height);
  tankSprites.forEach((tankSprite) => drawTank(context, tankSprite));
};
