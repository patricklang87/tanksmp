import { useCallback } from "react";
import Canvas from "../../../../components/common/canvas/canvas";
import type { Cloud, ColorScheme } from "../../../../types";
import { drawClouds } from "./cloudDrawing";

const Clouds = ({ clouds, colorScheme }: { clouds: Cloud[]; colorScheme: ColorScheme }) => {
  const draw = useCallback(
    (context: CanvasRenderingContext2D) =>
      drawClouds(context, { clouds, cloudColor: colorScheme.cloudColor }),
    [clouds, colorScheme]
  );
  return <Canvas draw={draw} label="Clouds" />;
};

export default Clouds;
