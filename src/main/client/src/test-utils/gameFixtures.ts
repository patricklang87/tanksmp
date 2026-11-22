import type { Game, Player, Tank, TankAction, TankActions, TurnResult } from "../types";

const buildAction = (overrides: Partial<TankAction>): TankAction => ({
  name: "STANDARD_SHOT",
  displayName: "Standard Shot",
  damage: 20,
  type: "PROJECTILE",
  rounds: null,
  explosionColor: [250, 183, 0],
  limitedUse: false,
  ...overrides,
});

const buildTankActions = (): TankActions => ({
  standardShot: buildAction({}),
  steelShotput: buildAction({ name: "STEEL_SHOTPUT", displayName: "Steel Shotput", rounds: 3 }),
  begemot: buildAction({ name: "BEGEMOT", displayName: "Begemot", rounds: 1 }),
  drive: buildAction({ name: "DRIVE", displayName: "Drive", type: "DRIVE", damage: 0 }),
});

export const buildTank = (colorIndex: number): Tank => ({
  colorIndex,
  position: null,
  turretAngle: -90,
  shotPower: 50,
  driveDistance: 0,
  shields: 100,
  tankActions: buildTankActions(),
  selectedAction: "STANDARD_SHOT",
  remainingRounds: { STEEL_SHOTPUT: 3, BEGEMOT: 1 },
});

export const buildPlayer = (playerIndex: number, name: string, colorIndex: number): Player => ({
  name,
  tank: buildTank(colorIndex),
  playerIndex,
  wins: 0,
});

export const buildGame = (overrides: Partial<Game> = {}): Game => {
  const players = overrides.players ?? [];
  const claimedColors = ["", "", "", "", "", ""];
  players.forEach((player) => {
    claimedColors[player.tank.colorIndex] = player.name;
  });
  return {
    gameId: "match-1",
    players,
    gameStatus: "NEW",
    topography: [],
    clouds: [],
    colorSchema: "DAY_COLORS",
    currentPlayerIndex: 0,
    hostPlayerIndex: players.length > 0 ? 0 : null,
    winnerIndex: null,
    turnNumber: 0,
    maxPlayerCount: 6,
    claimedColors,
    ...overrides,
  };
};

export const buildTurnResult = (overrides: Partial<TurnResult> = {}): TurnResult => ({
  actingPlayerIndex: 0,
  actionName: "STANDARD_SHOT",
  turretAngle: -45,
  shotPower: 60,
  projectilePath: [
    { x: 100, y: 300 },
    { x: 105, y: 295 },
    { x: 110, y: 292 },
  ],
  drivePath: [],
  explosion: { center: { x: 110, y: 292 }, maxRadius: 2, color: [250, 183, 0] },
  struckPlayerIndexes: [1],
  shieldsAfter: [100, 80],
  fallTargets: [null, 310],
  topographyAfter: [
    { x: 0, y: 300 },
    { x: 1400, y: 300 },
  ],
  nextPlayerIndex: 1,
  winnerIndex: null,
  ...overrides,
});

/** A started two-player match with both tanks standing on flat ground at y = 300. */
export const buildRunningGame = (overrides: Partial<Game> = {}): Game => {
  const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];
  players[0].tank.position = { x: 100, y: 290 };
  players[1].tank.position = { x: 400, y: 290 };
  return buildGame({
    players,
    gameStatus: "IN_PROGRESS",
    topography: [
      { x: 0, y: 300 },
      { x: 1400, y: 300 },
    ],
    clouds: [{ point: { x: 200, y: 80 }, size: 20 }],
    ...overrides,
  });
};
