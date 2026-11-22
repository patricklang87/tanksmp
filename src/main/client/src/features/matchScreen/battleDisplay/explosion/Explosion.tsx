import { useCallback, useEffect } from "react";
import Canvas from "../../../../components/common/canvas/canvas";
import { drawCircle } from "../../../../components/common/canvas/commonAnimationFunctions";
import { useFrameCounter } from "../../../../components/common/canvas/useAnimationFrame";
import type { Explosion as ExplosionData } from "../../../../types";
import { arrayToRgba } from "../../../../util/color";
import { getExplosionFrameCount, getExplosionRadius } from "./explosionAnimation";

type ExplosionProps = {
  explosion: ExplosionData;
  onComplete: () => void;
};

/** Grows and shrinks the server's explosion. Mount it only while the explosion is happening. */
const Explosion = ({ explosion, onComplete }: ExplosionProps) => {
  const frameCount = useFrameCounter(true);
  const hasFinished = frameCount >= getExplosionFrameCount(explosion.maxRadius);

  useEffect(() => {
    if (hasFinished) onComplete();
  }, [hasFinished, onComplete]);

  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      const color = arrayToRgba(explosion.color);
      drawCircle(context, {
        radius: getExplosionRadius(frameCount, explosion.maxRadius),
        lineWidth: 3,
        strokeStyle: color,
        colorFill: color,
        startX: explosion.center.x,
        startY: explosion.center.y,
      });
    },
    [explosion, frameCount]
  );

  return <Canvas draw={draw} label="Explosion" />;
};

export default Explosion;
