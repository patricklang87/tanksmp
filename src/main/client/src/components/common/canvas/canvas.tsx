import { useLayoutEffect, useRef } from "react";
import { canvasConstants } from "../../../constants";

export type CanvasDrawCallback = (context: CanvasRenderingContext2D) => void;

interface CanvasProps {
  /** Called after mount and again whenever the callback identity changes. It must clear what it replaces. */
  draw: CanvasDrawCallback;
  /** Accessible description of what the layer shows. */
  label: string;
  className?: string;
  width?: number;
  height?: number;
}

const Canvas = ({
  draw,
  label,
  className = "layering-canvas",
  width = canvasConstants.width,
  height = canvasConstants.height,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // A layout effect draws before the browser paints, so a remounted layer never flashes empty.
  useLayoutEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      draw(context);
    }
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={label}
    />
  );
};

export default Canvas;
