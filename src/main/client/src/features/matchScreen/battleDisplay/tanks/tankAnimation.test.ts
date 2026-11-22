import { designConstants, environmentConstants, tankColor } from "../../../../constants";
import { buildRunningGame, buildTurnResult } from "../../../../test-utils/gameFixtures";
import {
  buildTankSprites,
  getDriveFrameCount,
  getFallFrameCount,
  getTankPositions,
} from "./tankAnimation";

const { players } = buildRunningGame();
const driveTurn = buildTurnResult({
  actionName: "DRIVE",
  projectilePath: [],
  explosion: null,
  struckPlayerIndexes: [],
  fallTargets: [null, null],
  drivePath: [
    { x: 103, y: 290 },
    { x: 106, y: 289 },
    { x: 109, y: 288 },
  ],
});
const fireTurn = buildTurnResult({ fallTargets: [null, 310] });

describe("getTankPositions", () => {
  it("keeps tanks where the pre-turn match has them when nothing is animating", () => {
    const positions = getTankPositions({ players, activeTurn: null, phase: "IDLE", frameCount: 0 });
    expect(positions).toEqual([players[0].tank.position, players[1].tank.position]);
  });

  it("moves only the acting tank along the drive path", () => {
    const positions = getTankPositions({
      players,
      activeTurn: driveTurn,
      phase: "DRIVING",
      frameCount: 1,
    });
    expect(positions[0]).toEqual({ x: 106, y: 289 });
    expect(positions[1]).toEqual(players[1].tank.position);
  });

  it("stays on the last drive point once the frames run out", () => {
    const positions = getTankPositions({
      players,
      activeTurn: driveTurn,
      phase: "DRIVING",
      frameCount: 50,
    });
    expect(positions[0]).toEqual({ x: 109, y: 288 });
  });

  it("lowers a falling tank at the fall speed and stops at its target", () => {
    const speed = environmentConstants.fallAnimationSpeed;
    const falling = getTankPositions({
      players,
      activeTurn: fireTurn,
      phase: "FALLING",
      frameCount: 2,
    });
    expect(falling[1]).toEqual({ x: 400, y: 290 + 2 * speed });
    const landed = getTankPositions({
      players,
      activeTurn: fireTurn,
      phase: "FALLING",
      frameCount: 100,
    });
    expect(landed[1]).toEqual({ x: 400, y: 310 });
    expect(landed[0]).toEqual(players[0].tank.position);
  });

  it("keeps a tank without a position out of the picture", () => {
    const waitingPlayers = buildRunningGame().players;
    waitingPlayers[1].tank.position = null;
    const positions = getTankPositions({
      players: waitingPlayers,
      activeTurn: fireTurn,
      phase: "FALLING",
      frameCount: 3,
    });
    expect(positions[1]).toBeNull();
  });
});

describe("frame counts", () => {
  it("equals the number of drive path points", () => {
    expect(getDriveFrameCount(driveTurn)).toBe(3);
  });

  it("covers the longest fall", () => {
    expect(getFallFrameCount(players, fireTurn)).toBe(
      Math.ceil(20 / environmentConstants.fallAnimationSpeed)
    );
  });

  it("is 0 when nothing falls", () => {
    expect(getFallFrameCount(players, buildTurnResult({ fallTargets: [null, null] }))).toBe(0);
  });
});

describe("buildTankSprites", () => {
  it("flashes struck tanks red during the explosion with their new shields", () => {
    const sprites = buildTankSprites({
      players,
      activeTurn: fireTurn,
      phase: "EXPLOSION",
      frameCount: 0,
    });
    expect(sprites[0].color).toEqual(tankColor[0]);
    expect(sprites[1].color).toEqual(designConstants.struckTankColor);
    expect(sprites[1].shields).toBe(80);
  });

  it("uses the pre-turn shields and colors before the explosion", () => {
    const sprites = buildTankSprites({
      players,
      activeTurn: fireTurn,
      phase: "PROJECTILE",
      frameCount: 0,
    });
    expect(sprites[1].color).toEqual(tankColor[3]);
    expect(sprites[1].shields).toBe(100);
  });
});

describe("buildTankSprites local aim", () => {
  it("draws the local aim on the local player's tank only", () => {
    const sprites = buildTankSprites({
      players,
      activeTurn: null,
      phase: "IDLE",
      frameCount: 0,
      localAim: { playerIndex: 1, turretAngle: -30 },
    });
    expect(sprites[0].turretAngle).toBe(players[0].tank.turretAngle);
    expect(sprites[1].turretAngle).toBe(-30);
  });
});

describe("buildTankSprites turret during a replay", () => {
  it("draws the acting tank at the angle the server resolved the turn with", () => {
    const livePlayers = buildRunningGame().players;
    livePlayers[0].tank.turretAngle = -170; // stale live aim from before the final slider move
    const sprites = buildTankSprites({
      players: livePlayers,
      activeTurn: buildTurnResult({ actingPlayerIndex: 0, turretAngle: -45 }),
      phase: "PROJECTILE",
      frameCount: 0,
    });
    expect(sprites[0].turretAngle).toBe(-45);
    expect(sprites[1].turretAngle).toBe(livePlayers[1].tank.turretAngle);
  });

  it("prefers the resolved turn over the local aim for the acting tank", () => {
    const sprites = buildTankSprites({
      players,
      activeTurn: buildTurnResult({ actingPlayerIndex: 1, turretAngle: -120 }),
      phase: "PROJECTILE",
      frameCount: 0,
      localAim: { playerIndex: 1, turretAngle: -30 },
    });
    expect(sprites[1].turretAngle).toBe(-120);
  });
});
