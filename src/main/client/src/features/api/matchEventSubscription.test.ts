import { applyAimToGame, handleMatchEvent, subscribeToMatchEvents } from "./matchEventSubscription";
import { connectToSocket } from "./stompConnection";
import { setupStore } from "../../redux/store";
import { buildRunningGame, buildTurnResult } from "../../test-utils/gameFixtures";
import { seatClaimed } from "../../redux/sessionSlice";
import type { AimUpdate, MatchEvent } from "../../types";

jest.mock("./stompConnection");

const game = buildRunningGame();
const gameAfterTurn = buildRunningGame({ turnNumber: 1 });

const buildDependencies = () => {
  const store = setupStore();
  const applyGame = jest.fn();
  const applyAim = jest.fn();
  return {
    store,
    applyGame,
    applyAim,
    dependencies: { dispatch: store.dispatch, getState: store.getState, applyGame, applyAim },
  };
};

describe("handleMatchEvent", () => {
  it("applies a GAME_UPDATED event immediately", () => {
    const { applyGame, dependencies } = buildDependencies();
    handleMatchEvent({ type: "GAME_UPDATED", game, turnResult: null }, dependencies);
    expect(applyGame).toHaveBeenCalledWith(game);
  });

  it("holds a TURN_RESOLVED game and replays the turn instead", () => {
    const { store, applyGame, dependencies } = buildDependencies();
    const turnResult = buildTurnResult();
    handleMatchEvent({ type: "TURN_RESOLVED", game: gameAfterTurn, turnResult }, dependencies);
    expect(applyGame).not.toHaveBeenCalled();
    expect(store.getState().turnAnimation.activeTurn).toBe(turnResult);
    expect(store.getState().turnAnimation.phase).toBe("PROJECTILE");
  });

  it("applies a GAME_UPDATED event received during a replay only after it", () => {
    const { store, applyGame, dependencies } = buildDependencies();
    handleMatchEvent(
      { type: "TURN_RESOLVED", game: gameAfterTurn, turnResult: buildTurnResult() },
      dependencies
    );
    handleMatchEvent({ type: "GAME_UPDATED", game, turnResult: null }, dependencies);
    expect(applyGame).not.toHaveBeenCalled();
    expect(store.getState().turnAnimation.queue).toHaveLength(1);
  });
});

describe("live aim events", () => {
  const aim: AimUpdate = {
    playerIndex: 1,
    turretAngle: -45,
    shotPower: 60,
    selectedActionName: "STEEL_SHOTPUT",
  };
  const aimEvent: MatchEvent = { type: "AIM_UPDATED", game: null, turnResult: null, aim };

  const claimSeat = (store: ReturnType<typeof setupStore>, playerIndex: number) =>
    store.dispatch(seatClaimed({ matchId: "match-1", playerIndex, playerToken: "token" }));

  it("patches another player's aim without touching the rest of the game", () => {
    const { store, applyGame, applyAim, dependencies } = buildDependencies();
    claimSeat(store, 0);
    handleMatchEvent(aimEvent, dependencies);
    expect(applyAim).toHaveBeenCalledWith(aim);
    expect(applyGame).not.toHaveBeenCalled();
  });

  it("ignores the aim of your own player index", () => {
    const { store, applyAim, dependencies } = buildDependencies();
    claimSeat(store, 1);
    handleMatchEvent(aimEvent, dependencies);
    expect(applyAim).not.toHaveBeenCalled();
  });

  it("ignores aim updates while a replay is running", () => {
    const { store, applyAim, dependencies } = buildDependencies();
    claimSeat(store, 0);
    handleMatchEvent(
      { type: "TURN_RESOLVED", game: gameAfterTurn, turnResult: buildTurnResult() },
      dependencies
    );
    handleMatchEvent(aimEvent, dependencies);
    expect(applyAim).not.toHaveBeenCalled();
  });

  it("applyAimToGame changes only the aiming player's turret angle, power and selected action", () => {
    const patchedGame = buildRunningGame();
    const untouchedGame = buildRunningGame();

    applyAimToGame(patchedGame, aim);

    expect(patchedGame.players[1].tank).toEqual({
      ...untouchedGame.players[1].tank,
      turretAngle: -45,
      shotPower: 60,
      selectedAction: "STEEL_SHOTPUT",
    });
    expect(patchedGame.players[0]).toEqual(untouchedGame.players[0]);
    expect(patchedGame.turnNumber).toBe(untouchedGame.turnNumber);
  });

  it("applyAimToGame ignores an unknown player index", () => {
    const patchedGame = buildRunningGame();
    expect(() => applyAimToGame(patchedGame, { ...aim, playerIndex: 5 })).not.toThrow();
    expect(patchedGame).toEqual(buildRunningGame());
  });
});

type FakeStompClient = {
  connected: boolean;
  connect: jest.Mock;
  subscribe: jest.Mock;
  disconnect: jest.Mock;
};

const createFakeStompClient = (): FakeStompClient => ({
  connected: false,
  connect: jest.fn(),
  subscribe: jest.fn(),
  disconnect: jest.fn(),
});

describe("subscribeToMatchEvents", () => {
  let fakeClient: FakeStompClient;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeClient = createFakeStompClient();
    jest.mocked(connectToSocket).mockReturnValue(fakeClient as never);
  });

  const startSubscription = ({
    cacheDataLoaded = Promise.resolve(),
    cacheEntryRemoved = new Promise<void>(() => undefined),
    refetchMatch = jest.fn().mockResolvedValue(undefined),
  }: {
    cacheDataLoaded?: Promise<unknown>;
    cacheEntryRemoved?: Promise<unknown>;
    refetchMatch?: jest.Mock;
  } = {}) => {
    const { applyGame, dependencies } = buildDependencies();
    const finished = subscribeToMatchEvents("match-1", {
      ...dependencies,
      cacheDataLoaded,
      cacheEntryRemoved,
      refetchMatch,
    });
    return { finished, applyGame, refetchMatch };
  };

  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("opens no socket when the initial request fails", async () => {
    const { finished } = startSubscription({ cacheDataLoaded: Promise.reject(new Error("404")) });
    await finished;
    expect(connectToSocket).not.toHaveBeenCalled();
  });

  it("does not open the socket before the initial data has loaded", async () => {
    let finishLoading: () => void = () => undefined;
    const cacheDataLoaded = new Promise<void>((resolve) => {
      finishLoading = resolve;
    });
    startSubscription({ cacheDataLoaded });
    await flushPromises();
    expect(connectToSocket).not.toHaveBeenCalled();
    finishLoading();
    await flushPromises();
    expect(connectToSocket).toHaveBeenCalledTimes(1);
  });

  it("subscribes to the match topic and refetches the match once after connecting", async () => {
    const { refetchMatch } = startSubscription();
    await flushPromises();
    expect(refetchMatch).not.toHaveBeenCalled();

    fakeClient.connect.mock.calls[0][1]();

    expect(fakeClient.subscribe).toHaveBeenCalledWith(
      "/topic/game-progress/match-1",
      expect.any(Function)
    );
    expect(refetchMatch).toHaveBeenCalledTimes(1);
  });

  it("feeds received broadcasts into the replay queue", async () => {
    const { applyGame } = startSubscription();
    await flushPromises();
    fakeClient.connect.mock.calls[0][1]();
    const onMessage = fakeClient.subscribe.mock.calls[0][1];

    const event: MatchEvent = { type: "GAME_UPDATED", game, turnResult: null };
    onMessage({ body: JSON.stringify(event) });

    expect(applyGame).toHaveBeenCalledWith(game);
  });

  it("does not subscribe when the cache entry was removed before the connection finished", async () => {
    let removeEntry: () => void = () => undefined;
    const cacheEntryRemoved = new Promise<void>((resolve) => {
      removeEntry = resolve;
    });
    const { finished, refetchMatch } = startSubscription({ cacheEntryRemoved });
    await flushPromises();

    removeEntry();
    await finished;
    fakeClient.connect.mock.calls[0][1]();

    expect(fakeClient.subscribe).not.toHaveBeenCalled();
    expect(refetchMatch).not.toHaveBeenCalled();
    expect(fakeClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it("disconnects an open connection when the cache entry is removed", async () => {
    let removeEntry: () => void = () => undefined;
    const cacheEntryRemoved = new Promise<void>((resolve) => {
      removeEntry = resolve;
    });
    const { finished } = startSubscription({ cacheEntryRemoved });
    await flushPromises();
    fakeClient.connected = true;
    fakeClient.connect.mock.calls[0][1]();

    removeEntry();
    await finished;

    expect(fakeClient.disconnect).toHaveBeenCalledTimes(1);
  });
});
