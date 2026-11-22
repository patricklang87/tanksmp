import { useCallback, useEffect } from "react";
import Canvas from "../../../../components/common/canvas/canvas";
import { useFrameCounter } from "../../../../components/common/canvas/useAnimationFrame";
import type { Player, TurnResult } from "../../../../types";
import type { TurnAnimationPhase } from "../../../../redux/turnAnimationSlice";
import { drawTanks } from "./tankDrawing";
import { buildTankSprites, getDriveFrameCount, getFallFrameCount } from "./tankAnimation";
import type { LocalAim } from "./tankAnimation";

type TanksProps = {
  players: Player[];
  activeTurn: TurnResult | null;
  phase: TurnAnimationPhase;
  onPhaseComplete: () => void;
  localAim?: LocalAim;
};

/** Draws the tanks, and animates the driving and falling phases of a replay. */
const Tanks = ({ players, activeTurn, phase, onPhaseComplete, localAim }: TanksProps) => {
  const isDriving = phase === "DRIVING";
  const isFalling = phase === "FALLING";
  const frameCount = useFrameCounter(isDriving || isFalling);

  useEffect(() => {
    if (!activeTurn) return;
    const totalFrames = isDriving
      ? getDriveFrameCount(activeTurn)
      : isFalling
        ? getFallFrameCount(players, activeTurn)
        : null;
    if (totalFrames !== null && frameCount >= totalFrames) {
      onPhaseComplete();
    }
  }, [frameCount, isDriving, isFalling, activeTurn, players, onPhaseComplete]);

  const draw = useCallback(
    (context: CanvasRenderingContext2D) =>
      drawTanks(context, buildTankSprites({ players, activeTurn, phase, frameCount, localAim })),
    [players, activeTurn, phase, frameCount, localAim]
  );

  return <Canvas draw={draw} label="Tanks" />;
};

export default Tanks;
