import reducer, {
  SESSION_STORAGE_KEY,
  emptySession,
  loadSession,
  matchSelected,
  saveSession,
  seatClaimed,
  sessionCleared,
} from "./sessionSlice";

const seatedSession = { matchId: "match-1", playerIndex: 1, playerToken: "secret-token" };

describe("sessionSlice reducers", () => {
  it("remembers a selected match without a seat", () => {
    const state = reducer(seatedSession, matchSelected("match-2"));
    expect(state).toEqual({ matchId: "match-2", playerIndex: null, playerToken: null });
  });

  it("stores the seat claimed by joining", () => {
    const state = reducer(emptySession, seatClaimed(seatedSession));
    expect(state).toEqual(seatedSession);
  });

  it("clears everything", () => {
    expect(reducer(seatedSession, sessionCleared())).toEqual(emptySession);
  });
});

describe("session persistence", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("restores a saved session", () => {
    saveSession(seatedSession);
    expect(loadSession()).toEqual(seatedSession);
  });

  it("starts empty when nothing was saved", () => {
    expect(loadSession()).toEqual(emptySession);
  });

  it("ignores corrupt or wrongly shaped stored data", () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "{not json");
    expect(loadSession()).toEqual(emptySession);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ matchId: 42 }));
    expect(loadSession()).toEqual(emptySession);
  });

  it("works without sessionStorage", () => {
    const unavailableStorage = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    const failingWrite = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(loadSession()).toEqual(emptySession);
    expect(() => saveSession(seatedSession)).not.toThrow();
    unavailableStorage.mockRestore();
    failingWrite.mockRestore();
  });
});
