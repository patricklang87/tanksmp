import { useCallback } from "react";
import Canvas from "../../../../components/common/canvas/canvas";
import type { ColorScheme, Point2D } from "../../../../types";
import { drawTopography } from "./topographyDrawing";

const Topography = ({
  topography,
  colorScheme,
}: {
  topography: Point2D[];
  colorScheme: ColorScheme;
}) => {
  const draw = useCallback(
    (context: CanvasRenderingContext2D) =>
      drawTopography(context, { topography, colors: colorScheme }),
    [topography, colorScheme]
  );
  return <Canvas draw={draw} label="Terrain" />;
};

export default Topography;
