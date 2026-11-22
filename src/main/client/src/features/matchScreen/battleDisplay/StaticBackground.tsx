import { useCallback } from "react";
import Canvas from "../../../components/common/canvas/canvas";
import { canvasConstants } from "../../../constants";
import type { ColorScheme } from "../../../types";

const StaticBackground = ({ colorScheme }: { colorScheme: ColorScheme }) => {
  const drawBackground = useCallback(
    (context: CanvasRenderingContext2D) => {
      const skyGradient = context.createLinearGradient(0, canvasConstants.height, 0, 0);
      skyGradient.addColorStop(0, colorScheme.lowSkyColor);
      skyGradient.addColorStop(1, colorScheme.skyColor);
      context.fillStyle = skyGradient;
      context.fillRect(0, 0, canvasConstants.width, canvasConstants.height);
    },
    [colorScheme]
  );

  return <Canvas draw={drawBackground} label="Sky" />;
};

export default StaticBackground;
