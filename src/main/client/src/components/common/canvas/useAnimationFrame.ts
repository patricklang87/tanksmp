import { useEffect, useRef, useState } from "react";

/** Calls `onFrame` once per browser animation frame while `isActive` is true. */
export const useAnimationFrame = (onFrame: () => void, isActive: boolean): void => {
  // Keep the latest callback in a ref so the loop is not restarted by every new function identity.
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!isActive) return undefined;
    let animationFrameId = requestAnimationFrame(function runFrame() {
      onFrameRef.current();
      animationFrameId = requestAnimationFrame(runFrame);
    });
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);
};

/** Counts animation frames while `isActive`; the count goes back to 0 when the animation stops. */
export const useFrameCounter = (isActive: boolean): number => {
  const [frameCount, setFrameCount] = useState(0);
  useAnimationFrame(() => setFrameCount((previousCount) => previousCount + 1), isActive);
  useEffect(() => {
    if (!isActive) setFrameCount(0);
  }, [isActive]);
  return frameCount;
};
