import { designConstants, environmentConstants, tankColor } from "../../../../constants";
import type { Player, Point2D } from "../../../../types";
import type { TurnResult } from "../../../../types";
import type { TurnAnimationPhase } from "../../../../redux/turnAnimationSlice";
import type { TankSprite } from "./tankDrawing";

const lastIndexOf = (path: Point2D[], frameCount: number) =>
  Math.min(frameCount, path.length - 1);

/**
 * Where each tank is drawn at the given animation frame. Tanks stay where the pre-turn match has
 * them, except the driving tank (which follows the server's drive path) and tanks that fall into a crater.
 */
export const getTankPositions = ({
  players,
  activeTurn,
  phase,
  frameCount,
}: {
  players: Player[];
  activeTurn: TurnResult | null;
  phase: TurnAnimationPhase;
  frameCount: number;
}): (Point2D | null)[] =>
  players.map((player, playerIndex) => {
    const restingPosition = player.tank.position;
    if (!activeTurn || !restingPosition) return restingPosition;

    if (
      phase === "DRIVING" &&
      playerIndex === activeTurn.actingPlayerIndex &&
      activeTurn.drivePath.length > 0
    ) {
      return activeTurn.drivePath[lastIndexOf(activeTurn.drivePath, frameCount)];
    }

    const fallTarget = activeTurn.fallTargets[playerIndex];
    if (phase === "FALLING" && fallTarget != null) {
      const fallenY = restingPosition.y + environmentConstants.fallAnimationSpeed * frameCount;
      return { x: restingPosition.x, y: Math.min(fallenY, fallTarget) };
    }
    return restingPosition;
  });

/** How many animation frames the driving tank needs to follow the whole drive path. */
export const getDriveFrameCount = (activeTurn: TurnResult): number => activeTurn.drivePath.length;

/** How many animation frames the slowest-falling tank needs to reach its target. */
export const getFallFrameCount = (players: Player[], activeTurn: TurnResult): number => {
  const fallDistances = players.map((player, playerIndex) => {
    const fallTarget = activeTurn.fallTargets[playerIndex];
    const restingPosition = player.tank.position;
    return fallTarget != null && restingPosition ? Math.max(0, fallTarget - restingPosition.y) : 0;
  });
  return Math.ceil(Math.max(0, ...fallDistances) / environmentConstants.fallAnimationSpeed);
};

/** The aim the local player is setting up; it is previewed on their own turret only. */
export type LocalAim = { playerIndex: number; turretAngle: number };

/** The tanks as they should be drawn: positioned, colored (flashing red when struck) and aimed. */
export const buildTankSprites = ({
  players,
  activeTurn,
  phase,
  frameCount,
  localAim,
}: {
  players: Player[];
  activeTurn: TurnResult | null;
  phase: TurnAnimationPhase;
  frameCount: number;
  localAim?: LocalAim;
}): TankSprite[] => {
  const positions = getTankPositions({ players, activeTurn, phase, frameCount });
  const damageIsVisible = phase === "EXPLOSION" || phase === "FALLING";
  const sprites: TankSprite[] = [];
  players.forEach((player, playerIndex) => {
    const position = positions[playerIndex];
    if (!position) return;
    const isStruck = phase === "EXPLOSION" && !!activeTurn?.struckPlayerIndexes.includes(playerIndex);
    sprites.push({
      position,
      color: isStruck ? designConstants.struckTankColor : tankColor[player.tank.colorIndex],
      shields: damageIsVisible && activeTurn ? activeTurn.shieldsAfter[playerIndex] : player.tank.shields,
      turretAngle: localAim?.playerIndex === playerIndex ? localAim.turretAngle : player.tank.turretAngle,
    });
  });
  return sprites;
};
