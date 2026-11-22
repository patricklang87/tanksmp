import { canvasConstants } from "../../../../constants";
import type { Cloud } from "../../../../types";

const drawCloud = (context: CanvasRenderingContext2D, cloud: Cloud, cloudColor: string): void => {
  const { point, size } = cloud;
  context.beginPath();
  context.arc(point.x, point.y, size, 0.5 * Math.PI, 1.5 * Math.PI);
  context.rect(point.x, point.y - size, size * 4, size * 2);
  context.arc(point.x + size * 4, point.y, size, 1.5 * Math.PI, 0.5 * Math.PI);
  context.arc(point.x + 1.5 * size, point.y - size, 1.5 * size, 0, 2 * Math.PI);
  context.arc(point.x + 3 * size, point.y - size, size, 0, 2 * Math.PI);
  context.closePath();

  context.lineWidth = 1;
  context.strokeStyle = cloudColor;
  context.stroke();
  context.fillStyle = cloudColor;
  context.fill();
};

export const drawClouds = (
  context: CanvasRenderingContext2D,
  { clouds, cloudColor }: { clouds: Cloud[]; cloudColor: string }
): void => {
  context.clearRect(0, 0, canvasConstants.width, canvasConstants.height);
  clouds.forEach((cloud) => drawCloud(context, cloud, cloudColor));
};
