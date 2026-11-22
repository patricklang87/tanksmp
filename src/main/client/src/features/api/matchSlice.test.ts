/**
 * @jest-environment node
 */
import { matchApi } from "./matchSlice";
import { setupStore } from "../../redux/store";
import { gameUpdateReceived, turnEnqueued } from "../../redux/turnAnimationSlice";
import { buildRunningGame, buildTurnResult } from "../../test-utils/gameFixtures";

jest.mock("./matchEventSubscription", () => ({
  subscribeToMatchEvents: jest.fn(() => Promise.resolve()),
  applyAimToGame: jest.fn(),
}));

const NativeRequest = globalThis.Request;

describe("matchApi rematchMatch", () => {
  beforeAll(() => {
    // fetchBaseQuery builds a Request from the relative "/api" URL, which Node cannot resolve.
    globalThis.Request = class extends NativeRequest {
      constructor(input: RequestInfo | URL, init?: RequestInit) {
        super(typeof input === "string" ? new URL(input, "http://localhost").href : input, init);
      }
    } as typeof Request;
  });

  afterAll(() => {
    globalThis.Request = NativeRequest;
  });

  const openStores: ReturnType<typeof setupStore>[] = [];

  afterEach(() => {
    // Drop the cache so RTK Query's cleanup timers do not keep Jest alive.
    openStores.splice(0).forEach((store) => store.dispatch(matchApi.util.resetApiState()));
    jest.restoreAllMocks();
  });

  it("posts with the player token and writes the returned game into the getMatch cache", async () => {
    const finishedGame = buildRunningGame({ gameStatus: "FINISHED", winnerIndex: 0, turnNumber: 5 });
    const restartedGame = buildRunningGame({ turnNumber: 0 });
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(restartedGame), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const store = setupStore();
    openStores.push(store);
    store.dispatch(matchApi.util.upsertQueryData("getMatch", "match-1", finishedGame));
    await Promise.resolve();

    await store
      .dispatch(matchApi.endpoints.rematchMatch.initiate({ matchId: "match-1", playerToken: "host-token" }))
      .unwrap();

    const sentRequest = fetchSpy.mock.calls[0][0] as Request;
    expect(sentRequest.method).toBe("POST");
    expect(new URL(sentRequest.url).pathname).toBe("/api/matches/match-1/rematch");
    expect(sentRequest.headers.get("X-Player-Token")).toBe("host-token");
    expect(matchApi.endpoints.getMatch.select("match-1")(store.getState()).data).toEqual(restartedGame);
  });

  it("clears any leftover replay state when the new match starts", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(buildRunningGame()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const store = setupStore();
    openStores.push(store);
    store.dispatch(
      turnEnqueued({ turnResult: buildTurnResult(), resultingGame: buildRunningGame({ turnNumber: 9 }) })
    );
    store.dispatch(gameUpdateReceived(buildRunningGame({ turnNumber: 10 })));

    await store
      .dispatch(matchApi.endpoints.rematchMatch.initiate({ matchId: "match-1", playerToken: "host-token" }))
      .unwrap();

    const { turnAnimation } = store.getState();
    expect(turnAnimation.phase).toBe("IDLE");
    expect(turnAnimation.activeTurn).toBeNull();
    expect(turnAnimation.queue).toEqual([]);
    expect(turnAnimation.gameToApply).toBeNull();
  });

  it("leaves the cache untouched when the server rejects the rematch", async () => {
    const finishedGame = buildRunningGame({ gameStatus: "FINISHED", winnerIndex: 0 });
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Only the host can start a rematch." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    );
    const store = setupStore();
    openStores.push(store);
    store.dispatch(matchApi.util.upsertQueryData("getMatch", "match-1", finishedGame));
    await Promise.resolve();

    await expect(
      store
        .dispatch(matchApi.endpoints.rematchMatch.initiate({ matchId: "match-1", playerToken: "guest" }))
        .unwrap()
    ).rejects.toMatchObject({ status: 403 });
    expect(matchApi.endpoints.getMatch.select("match-1")(store.getState()).data).toEqual(finishedGame);
  });
});
