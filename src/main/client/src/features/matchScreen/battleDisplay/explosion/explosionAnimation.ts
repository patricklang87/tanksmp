import { environmentConstants } from "../../../../constants";

/** Frames the explosion takes to grow to its maximum radius and shrink away again. */
export const getExplosionFrameCount = (maxRadius: number): number =>
  Math.ceil((2 * maxRadius) / environmentConstants.explosionRate);

/** The radius at a frame: it grows at the explosion rate up to maxRadius, then shrinks the same way. */
export const getExplosionRadius = (frameCount: number, maxRadius: number): number => {
  const grownRadius = frameCount * environmentConstants.explosionRate;
  const radius = grownRadius <= maxRadius ? grownRadius : 2 * maxRadius - grownRadius;
  return Math.max(0, radius);
};
