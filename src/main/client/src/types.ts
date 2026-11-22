export type Action = {
  name: string;
  displayName: string;
  damage?: number;
  type: string;
  rounds?: number | string;
  fuel?: number;
  explosionColor?: number[];
};

export type Tuple = [number, number];

export type NullTuple = [null, null];

export type ColorScheme = {
  lowSkyColor: string;
  skyColor: string;
  landscapeStrokeStyle: string;
  landscapeFillStyle: string;
  cloudColor: string;
}

// ---------------------------------------------------------------------------
// Server API types. These mirror the JSON the Java server sends and receives.
// ---------------------------------------------------------------------------

export type Point2D = { x: number; y: number };

export type Cloud = { point: Point2D; size: number };

export type GameStatus = "NEW" | "IN_PROGRESS" | "FINISHED";

export type ColorSchemaName = "DAY_COLORS" | "DUSK_COLORS";

export type TankActionName =
  | "STANDARD_SHOT"
  | "STEEL_SHOTPUT"
  | "DRIVE"
  | "BEGEMOT";

export type TankAction = {
  name: TankActionName;
  displayName: string;
  damage: number;
  type: "PROJECTILE" | "DRIVE";
  /** Null means unlimited use. */
  rounds: number | null;
  explosionColor: number[] | null;
  limitedUse: boolean;
};

export type TankActions = {
  standardShot: TankAction;
  steelShotput: TankAction;
  begemot: TankAction;
  drive: TankAction;
};

export type Tank = {
  /** Index into the shared tank color palette, 0 to 5. */
  colorIndex: number;
  /** Top-left corner of the tank in canvas coordinates; null until the match starts. */
  position: Point2D | null;
  /** Degrees; -90 points straight up, -180 and 0 point left and right. */
  turretAngle: number;
  shotPower: number;
  /** Signed horizontal distance the tank will drive on its next drive turn. */
  driveDistance: number;
  shields: number;
  tankActions: TankActions;
  selectedAction: TankActionName;
  /** Rounds left per limited weapon; weapons without an entry have unlimited use. */
  remainingRounds: Partial<Record<TankActionName, number>>;
};

export type Player = {
  name: string;
  tank: Tank;
  /** Position in the match's player list; also the index of the player's tank. */
  playerIndex: number;
  wins: number | null;
};

export type Game = {
  gameId: string;
  players: Player[];
  gameStatus: GameStatus;
  topography: Point2D[];
  clouds: Cloud[];
  colorSchema: ColorSchemaName;
  currentPlayerIndex: number;
  /** The first player to join; null until someone joins. */
  hostPlayerIndex: number | null;
  /** Null while the match continues; the survivor's index once over, or -1 if nobody survived. */
  winnerIndex: number | null;
  turnNumber: number;
  maxPlayerCount: number;
  /** Per color index: the name of the player who claimed it, or an empty string. */
  claimedColors: string[];
};

export type Explosion = {
  center: Point2D;
  maxRadius: number;
  color: number[];
};

export type TurnResult = {
  actingPlayerIndex: number;
  actionName: TankActionName;
  projectilePath: Point2D[];
  drivePath: Point2D[];
  explosion: Explosion | null;
  struckPlayerIndexes: number[];
  shieldsAfter: number[];
  /** Per player the y a tank falls to, or null when it does not fall. */
  fallTargets: (number | null)[];
  topographyAfter: Point2D[];
  nextPlayerIndex: number;
  winnerIndex: number | null;
};

export type MatchEventType = "GAME_UPDATED" | "TURN_RESOLVED";

/** Broadcast on /topic/game-progress/{matchId}. turnResult is only set for TURN_RESOLVED. */
export type MatchEvent = {
  type: MatchEventType;
  game: Game;
  turnResult: TurnResult | null;
};

export type JoinMatchRequest = {
  playerName: string;
  requestedColor: number;
};

/** The player token is only returned here and authorizes the player's later commands. */
export type JoinMatchResponse = {
  game: Game;
  playerIndex: number;
  playerToken: string;
};

export type TurnCommand = {
  actionName: TankActionName;
  turretAngle?: number;
  shotPower?: number;
  driveDistance?: number;
};

/** Body of every error response from the server. */
export type ApiErrorBody = { message: string };
