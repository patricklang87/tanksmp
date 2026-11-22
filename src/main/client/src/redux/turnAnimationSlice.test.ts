import reducer, {
  applyPendingGame,
  gameApplied,
  gameUpdateReceived,
  nextPhaseOf,
  phaseCompleted,
  replayDiscarded,
  turnEnqueued,
  type TurnAnimationState,
} from "./turnAnimationSlice";
import { buildRunningGame, buildTurnResult } from "../test-utils/gameFixtures";
import { setupStore } from "./store";

const idleState = reducer(undefined, { type: "init" });
const gameAfterTurn = buildRunningGame({ turnNumber: 1, currentPlayerIndex: 1 });
const fireTurn = buildTurnResult();
const driveTurn = buildTurnResult({
  actionName: "DRIVE",
  projectilePath: [],
  explosion: null,
  struckPlayerIndexes: [],
  fallTargets: [null, null],
  drivePath: [{ x: 103, y: 290 }],
});

const enqueue = (state: TurnAnimationState, turnResult = fireTurn, resultingGame = gameAfterTurn) =>
  reducer(state, turnEnqueued({ turnResult, resultingGame }));

describe("turnAnimationSlice", () => {
  it("starts idle", () => {
    expect(idleState.phase).toBe("IDLE");
    expect(idleState.activeTurn).toBeNull();
  });

  it("replays a fire turn as PROJECTILE, EXPLOSION, FALLING, then IDLE", () => {
    let state = enqueue(idleState);
    expect(state.phase).toBe("PROJECTILE");
    expect(state.activeTurn).toBe(fireTurn);

    state = reducer(state, phaseCompleted());
    expect(state.phase).toBe("EXPLOSION");
    state = reducer(state, phaseCompleted());
    expect(state.phase).toBe("FALLING");
    state = reducer(state, phaseCompleted());
    expect(state.phase).toBe("IDLE");
    expect(state.activeTurn).toBeNull();
  });

  it("replays a drive turn as DRIVING then IDLE", () => {
    let state = enqueue(idleState, driveTurn);
    expect(state.phase).toBe("DRIVING");
    state = reducer(state, phaseCompleted());
    expect(state.phase).toBe("IDLE");
  });

  it("skips the explosion and falling phases when a shot hits nothing", () => {
    const missTurn = buildTurnResult({
      explosion: null,
      struckPlayerIndexes: [],
      fallTargets: [null, null],
    });
    let state = enqueue(idleState, missTurn);
    expect(state.phase).toBe("PROJECTILE");
    state = reducer(state, phaseCompleted());
    expect(state.phase).toBe("IDLE");
  });

  it("skips falling when no tank falls", () => {
    const noFallTurn = buildTurnResult({ fallTargets: [null, null] });
    expect(nextPhaseOf(noFallTurn, "EXPLOSION")).toBe("IDLE");
  });

  it("holds the server's game until the replay finishes, then hands it over", () => {
    let state = enqueue(idleState);
    expect(state.gameToApply).toBeNull();
    state = reducer(state, phaseCompleted());
    state = reducer(state, phaseCompleted());
    expect(state.gameToApply).toBeNull();
    state = reducer(state, phaseCompleted());
    expect(state.gameToApply).toBe(gameAfterTurn);
    state = reducer(state, gameApplied());
    expect(state.gameToApply).toBeNull();
  });

  it("applies a turn with nothing to animate immediately", () => {
    const standStillTurn = buildTurnResult({ ...driveTurn, drivePath: [] });
    const state = enqueue(idleState, standStillTurn);
    expect(state.phase).toBe("IDLE");
    expect(state.gameToApply).toBe(gameAfterTurn);
  });

  it("applies a plain game update immediately when idle", () => {
    const lobbyGame = buildRunningGame({ turnNumber: 5 });
    const state = reducer(idleState, gameUpdateReceived(lobbyGame));
    expect(state.gameToApply).toBe(lobbyGame);
    expect(state.queue).toHaveLength(0);
  });

  it("applies a game update only after the running replay ends", () => {
    const laterGame = buildRunningGame({ turnNumber: 9 });
    let state = enqueue(idleState);
    state = reducer(state, gameUpdateReceived(laterGame));
    expect(state.gameToApply).toBeNull();
    state = reducer(state, phaseCompleted());
    state = reducer(state, phaseCompleted());
    state = reducer(state, phaseCompleted());
    expect(state.phase).toBe("IDLE");
    expect(state.gameToApply).toBe(laterGame);
  });

  it("queues a second turn behind the first and shows the first result before replaying it", () => {
    const secondGame = buildRunningGame({ turnNumber: 2 });
    let state = enqueue(idleState);
    state = enqueue(state, driveTurn, secondGame);
    expect(state.activeTurn).toBe(fireTurn);
    state = reducer(state, phaseCompleted());
    state = reducer(state, phaseCompleted());
    state = reducer(state, phaseCompleted());
    expect(state.gameToApply).toBe(gameAfterTurn);
    expect(state.activeTurn).toBe(driveTurn);
    expect(state.phase).toBe("DRIVING");
    state = reducer(state, phaseCompleted());
    expect(state.gameToApply).toBe(secondGame);
    expect(state.phase).toBe("IDLE");
  });

  it("gives every replay its own id", () => {
    const first = enqueue(idleState);
    expect(first.replayId).toBe(1);
    const finished = reducer(reducer(reducer(first, phaseCompleted()), phaseCompleted()), phaseCompleted());
    expect(enqueue(finished).replayId).toBe(2);
  });

  it("ignores phaseCompleted when idle", () => {
    expect(reducer(idleState, phaseCompleted())).toEqual(idleState);
  });

  it("jumps to the newest game when the replay is discarded", () => {
    const secondGame = buildRunningGame({ turnNumber: 2 });
    let state = enqueue(idleState);
    state = enqueue(state, driveTurn, secondGame);
    state = reducer(state, replayDiscarded());
    expect(state.phase).toBe("IDLE");
    expect(state.activeTurn).toBeNull();
    expect(state.queue).toHaveLength(0);
    expect(state.gameToApply).toBe(secondGame);
  });
});

describe("applyPendingGame", () => {
  it("passes the pending game on once and clears it", () => {
    const store = setupStore();
    store.dispatch(gameUpdateReceived(gameAfterTurn));
    const applyGame = jest.fn();

    applyPendingGame(store.dispatch, store.getState, applyGame);
    applyPendingGame(store.dispatch, store.getState, applyGame);

    expect(applyGame).toHaveBeenCalledTimes(1);
    expect(applyGame).toHaveBeenCalledWith(gameAfterTurn);
    expect(store.getState().turnAnimation.gameToApply).toBeNull();
  });
});
