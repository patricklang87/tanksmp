import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Dispatch } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { Game, TurnResult } from "../types";

export type TurnAnimationPhase = "DRIVING" | "PROJECTILE" | "EXPLOSION" | "FALLING" | "IDLE";

/** Something the server told us that has to be shown in order, after earlier replays finish. */
type QueuedEvent =
  | { kind: "turn"; turnResult: TurnResult; resultingGame: Game }
  | { kind: "update"; game: Game };

export interface TurnAnimationState {
  phase: TurnAnimationPhase;
  /** The turn being replayed; null while idle. */
  activeTurn: TurnResult | null;
  /** The server's game after the active turn, applied once the replay finishes. */
  activeResultingGame: Game | null;
  queue: QueuedEvent[];
  /** A game that is ready to be shown (nothing is replaying); the consumer writes it to the cache. */
  gameToApply: Game | null;
  /** Increases with every replay that starts, so layers can restart their animations. */
  replayId: number;
}

const initialState: TurnAnimationState = {
  phase: "IDLE",
  activeTurn: null,
  activeResultingGame: null,
  queue: [],
  gameToApply: null,
  replayId: 0,
};

const fireTurnPhases: TurnAnimationPhase[] = ["PROJECTILE", "EXPLOSION", "FALLING"];
const driveTurnPhases: TurnAnimationPhase[] = ["DRIVING"];

const phaseHasWork = (phase: TurnAnimationPhase, turnResult: TurnResult): boolean => {
  switch (phase) {
    case "DRIVING":
      return turnResult.drivePath.length > 0;
    case "PROJECTILE":
      return turnResult.projectilePath.length > 0;
    case "EXPLOSION":
      return turnResult.explosion !== null;
    case "FALLING":
      return turnResult.fallTargets.some((fallTarget) => fallTarget !== null);
    default:
      return false;
  }
};

/** The next phase after `currentPhase` that has something to show, or IDLE if the replay is over. */
export const nextPhaseOf = (
  turnResult: TurnResult,
  currentPhase: TurnAnimationPhase
): TurnAnimationPhase => {
  const phases = turnResult.actionName === "DRIVE" ? driveTurnPhases : fireTurnPhases;
  const startIndex = currentPhase === "IDLE" ? 0 : phases.indexOf(currentPhase) + 1;
  return phases.slice(startIndex).find((phase) => phaseHasWork(phase, turnResult)) ?? "IDLE";
};

const startNextQueuedEvent = (state: TurnAnimationState): void => {
  while (state.activeTurn === null && state.queue.length > 0) {
    const nextEvent = state.queue.shift();
    if (!nextEvent) return;
    if (nextEvent.kind === "update") {
      state.gameToApply = nextEvent.game;
      continue;
    }
    const firstPhase = nextPhaseOf(nextEvent.turnResult, "IDLE");
    if (firstPhase === "IDLE") {
      // Nothing to animate (for example a drive that did not move): show the result right away.
      state.gameToApply = nextEvent.resultingGame;
      continue;
    }
    state.activeTurn = nextEvent.turnResult;
    state.activeResultingGame = nextEvent.resultingGame;
    state.phase = firstPhase;
    state.replayId += 1;
  }
};

const isReplayBusy = (state: TurnAnimationState): boolean =>
  state.activeTurn !== null || state.queue.length > 0;

const turnAnimationSlice = createSlice({
  name: "turnAnimation",
  initialState,
  reducers: {
    turnEnqueued: (
      state,
      action: PayloadAction<{ turnResult: TurnResult; resultingGame: Game }>
    ) => {
      state.queue.push({ kind: "turn", ...action.payload });
      startNextQueuedEvent(state);
    },
    /** A game that is not the outcome of a turn: shown right away unless a replay is running. */
    gameUpdateReceived: (state, action: PayloadAction<Game>) => {
      if (isReplayBusy(state)) {
        state.queue.push({ kind: "update", game: action.payload });
      } else {
        state.gameToApply = action.payload;
      }
    },
    /** The layer showing the current phase has finished it. */
    phaseCompleted: (state) => {
      if (state.activeTurn === null) return;
      const nextPhase = nextPhaseOf(state.activeTurn, state.phase);
      if (nextPhase !== "IDLE") {
        state.phase = nextPhase;
        return;
      }
      state.gameToApply = state.activeResultingGame;
      state.activeTurn = null;
      state.activeResultingGame = null;
      state.phase = "IDLE";
      startNextQueuedEvent(state);
    },
    gameApplied: (state) => {
      state.gameToApply = null;
    },
    /** A new match has begun: forget any replay or queued game from the previous one. */
    turnAnimationReset: (state) => ({ ...initialState, replayId: state.replayId + 1 }),
    /** Skips whatever is left of the replay, keeping the newest game so nothing is lost. */
    replayDiscarded: (state) => {
      const newestQueuedGame = [...state.queue]
        .reverse()
        .map((queuedEvent) =>
          queuedEvent.kind === "turn" ? queuedEvent.resultingGame : queuedEvent.game
        )[0];
      const newestGame = newestQueuedGame ?? state.activeResultingGame ?? state.gameToApply;
      state.queue = [];
      state.activeTurn = null;
      state.activeResultingGame = null;
      state.phase = "IDLE";
      state.gameToApply = newestGame;
    },
  },
});

export const { turnEnqueued, gameUpdateReceived, phaseCompleted, gameApplied,
  replayDiscarded,
  turnAnimationReset,
} =
  turnAnimationSlice.actions;

export const selectTurnAnimationPhase = (state: RootState) => state.turnAnimation.phase;
export const selectActiveTurn = (state: RootState) => state.turnAnimation.activeTurn;
export const selectReplayId = (state: RootState) => state.turnAnimation.replayId;
export const selectIsReplayInProgress = (state: RootState) => isReplayBusy(state.turnAnimation);

/** Hands a game that is ready to be shown to `applyGame` (which writes it to the match cache). */
export const applyPendingGame = (
  dispatch: Dispatch,
  getState: () => RootState,
  applyGame: (game: Game) => void
): void => {
  const pendingGame = getState().turnAnimation.gameToApply;
  if (!pendingGame) return;
  dispatch(gameApplied());
  applyGame(pendingGame);
};

export default turnAnimationSlice.reducer;
