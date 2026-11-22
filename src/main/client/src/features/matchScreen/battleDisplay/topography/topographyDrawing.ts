import { canvasConstants, designConstants } from "../../../../constants";
import type { ColorScheme, Point2D } from "../../../../types";

export const drawTopography = (
  context: CanvasRenderingContext2D,
  { topography, colors }: { topography: Point2D[]; colors: ColorScheme }
): void => {
  context.clearRect(0, 0, canvasConstants.width, canvasConstants.height);
  context.beginPath();
  topography.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  // Close the shape under the terrain so it can be filled.
  context.lineTo(canvasConstants.width, canvasConstants.height + designConstants.landscapeStrokeWidth);
  context.lineTo(0, canvasConstants.height);
  context.strokeStyle = colors.landscapeStrokeStyle;
  context.lineWidth = designConstants.landscapeStrokeWidth;
  context.stroke();
  context.fillStyle = colors.landscapeFillStyle;
  context.fill();
  context.closePath();
};
