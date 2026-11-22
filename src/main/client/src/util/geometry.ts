import type { Point2D } from "../types";

export const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

/** The point at `angle` degrees (measured clockwise on screen, as canvas does) and `radius` from `center`. */
export const getCoordinatesOnCircle = ({
  center,
  radius,
  angle,
}: {
  center: Point2D;
  radius: number;
  angle: number;
}): Point2D => ({
  x: center.x + radius * Math.cos(degreesToRadians(angle)),
  y: center.y + radius * Math.sin(degreesToRadians(angle)),
});

/** The y on the straight line through `point1` and `point2` at the given x. */
export const getYForXInLine = ({
  point1,
  point2,
  currentX,
}: {
  point1: Point2D;
  point2: Point2D;
  currentX: number;
}): number => {
  const slope = (point2.y - point1.y) / (point2.x - point1.x);
  const yIntercept = point1.y - slope * point1.x;
  return slope * currentX + yIntercept;
};
