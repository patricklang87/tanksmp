import { drawCircle } from "../../../../components/common/canvas/commonAnimationFunctions";
import type { Point2D } from "../../../../types";

export const PROJECTILE_COLOR = "#4F7CAC";

export const drawProjectile = (context: CanvasRenderingContext2D, position: Point2D): void => {
  drawCircle(context, {
    radius: 2,
    lineWidth: 3,
    strokeStyle: PROJECTILE_COLOR,
    colorFill: PROJECTILE_COLOR,
    startX: position.x,
    startY: position.y,
  });
};
