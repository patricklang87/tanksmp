import type { Game, Player, Tank, TankAction, TankActions } from "../types";

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
