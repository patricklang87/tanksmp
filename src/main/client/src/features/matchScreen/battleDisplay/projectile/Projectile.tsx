import { useCallback, useEffect } from "react";
import Canvas from "../../../../components/common/canvas/canvas";
import { useFrameCounter } from "../../../../components/common/canvas/useAnimationFrame";
import type { Point2D } from "../../../../types";
import { drawProjectile } from "./projectileDrawing";

type ProjectileProps = {
  /** The projectile's position on every frame, as computed by the server. */
  path: Point2D[];
  onComplete: () => void;
};

/** Replays a projectile frame by frame. Mount it only while the projectile is in flight. */
const Projectile = ({ path, onComplete }: ProjectileProps) => {
  const frameCount = useFrameCounter(true);
  const hasFinished = frameCount >= path.length;

  useEffect(() => {
    if (hasFinished) onComplete();
  }, [hasFinished, onComplete]);

  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (path.length === 0) return;
      drawProjectile(context, path[Math.min(frameCount, path.length - 1)]);
    },
    [path, frameCount]
  );

  return <Canvas draw={draw} label="Projectile" />;
};

export default Projectile;
