import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { useLobby } from "./useLobby";
import { setupStore } from "../../redux/store";
import { SESSION_STORAGE_KEY } from "../../redux/sessionSlice";
import { buildGame, buildPlayer } from "../../test-utils/gameFixtures";
import {
  mockMatchApi,
  rejectingTrigger,
  resolvingTrigger,
  serverError,
} from "../../test-utils/matchApiMocks";

jest.mock("../api/matchSlice");
jest.mock("../api/stompConnection");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const submitEvent = { preventDefault: jest.fn() };
const hostSeat = { matchId: "match-1", playerIndex: 0, playerToken: "host-token" };

const renderLobby = (storedSession?: object) => {
  window.sessionStorage.clear();
  if (storedSession) {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession));
  }
  const store = setupStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
  return { store, ...renderHook(() => useLobby(), { wrapper }) };
};

describe("useLobby step transitions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts on chooseMode and moves to enterMatchId when joining an existing match", () => {
    mockMatchApi();
    const { result } = renderLobby();
    expect(result.current.step).toBe("chooseMode");
    act(() => result.current.handleChooseJoinExisting());
    expect(result.current.step).toBe("enterMatchId");
  });

  it("creating a match selects it and moves to joinMatch", async () => {
    const { createMatch } = mockMatchApi({
      createMatch: resolvingTrigger(buildGame({ gameId: "new-match" })),
    });
    const { result, store } = renderLobby();
    await act(() => result.current.handleCreateMatch());
    expect(createMatch).toHaveBeenCalled();
    expect(store.getState().session.matchId).toBe("new-match");
    expect(result.current.step).toBe("joinMatch");
  });

  it("looking up an existing match moves to joinMatch", async () => {
    const { lookUpMatch } = mockMatchApi({
      lookUpMatch: resolvingTrigger(buildGame({ gameId: "abc" })),
    });
    const { result } = renderLobby();
    act(() => result.current.setMatchIdInput(" abc "));
    await act(() => result.current.handleLookUpMatch(submitEvent));
    expect(lookUpMatch).toHaveBeenCalledWith("abc");
    expect(result.current.step).toBe("joinMatch");
  });

  it("shows the server's message and stays put when the match ID is unknown", async () => {
    mockMatchApi({
      lookUpMatch: rejectingTrigger(serverError(404, "A game with that ID does not exist.")),
    });
    const { result } = renderLobby();
    act(() => result.current.handleChooseJoinExisting());
    act(() => result.current.setMatchIdInput("nope"));
    await act(() => result.current.handleLookUpMatch(submitEvent));
    expect(result.current.errorMessage).toBe("A game with that ID does not exist.");
    expect(result.current.step).toBe("enterMatchId");
  });

  it("joining stores the seat and moves to the waiting room", async () => {
    const joinedGame = buildGame({ players: [buildPlayer(0, "Ada", 2)] });
    const { joinMatch } = mockMatchApi({
      joinMatch: resolvingTrigger({ game: joinedGame, playerIndex: 0, playerToken: "token-0" }),
    });
    const { result, store } = renderLobby({ matchId: "match-1", playerIndex: null, playerToken: null });
    expect(result.current.step).toBe("joinMatch");
    act(() => result.current.setPlayerName(" Ada "));
    act(() => result.current.setRequestedColor(2));
    await act(() => result.current.handleJoinMatch(submitEvent));
    expect(joinMatch).toHaveBeenCalledWith({
      matchId: "match-1",
      playerName: "Ada",
      requestedColor: 2,
    });
    expect(store.getState().session).toEqual({
      matchId: "match-1",
      playerIndex: 0,
      playerToken: "token-0",
    });
    expect(result.current.step).toBe("waitingRoom");
  });

  it.each(["The given name is already taken for this game ID.", "That tank color has already been claimed.", "Game is not currently accepting players."])(
    "shows the join error %p and stays on joinMatch",
    async (message) => {
      mockMatchApi({ joinMatch: rejectingTrigger(serverError(400, message)) });
      const { result } = renderLobby({ matchId: "match-1", playerIndex: null, playerToken: null });
      act(() => result.current.setRequestedColor(1));
      await act(() => result.current.handleJoinMatch(submitEvent));
      expect(result.current.errorMessage).toBe(message);
      expect(result.current.step).toBe("joinMatch");
    }
  );

  it("restores the waiting room after a refresh and recognises the host", () => {
    const game = buildGame({ players: [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 1)] });
    mockMatchApi({ game });
    const { result } = renderLobby(hostSeat);
    expect(result.current.step).toBe("waitingRoom");
    expect(result.current.isHost).toBe(true);
  });

  it("does not treat other players as the host", () => {
    const game = buildGame({ players: [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 1)] });
    mockMatchApi({ game });
    const { result } = renderLobby({ ...hostSeat, playerIndex: 1, playerToken: "guest-token" });
    expect(result.current.isHost).toBe(false);
  });

  it("starts the match with the player token", async () => {
    const game = buildGame({ players: [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 1)] });
    const { startMatch } = mockMatchApi({ game });
    const { result } = renderLobby(hostSeat);
    await act(() => result.current.handleStartMatch());
    expect(startMatch).toHaveBeenCalledWith({ matchId: "match-1", playerToken: "host-token" });
  });

  it("navigates to /match when the game becomes IN_PROGRESS", async () => {
    const game = buildGame({
      gameStatus: "IN_PROGRESS",
      players: [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 1)],
    });
    mockMatchApi({ game });
    renderLobby(hostSeat);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/match"));
  });

  it("resets to chooseMode and clears the session when the stored match is gone", async () => {
    mockMatchApi({ loadMatchError: serverError(404, "A game with that ID does not exist.") });
    const { result, store } = renderLobby(hostSeat);
    await waitFor(() => expect(result.current.step).toBe("chooseMode"));
    expect(result.current.errorMessage).toBe("A game with that ID does not exist.");
    expect(store.getState().session.playerToken).toBeNull();
  });

  it("going back clears the selected match", () => {
    mockMatchApi();
    const { result, store } = renderLobby({ matchId: "match-1", playerIndex: null, playerToken: null });
    act(() => result.current.handleBackToStart());
    expect(result.current.step).toBe("chooseMode");
    expect(store.getState().session.matchId).toBeNull();
  });
});
