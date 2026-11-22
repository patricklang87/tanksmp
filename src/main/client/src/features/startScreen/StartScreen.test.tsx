import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import StartScreen from "./StartScreen";
import { GAME_TITLE } from "../../constants";
import { setupStore } from "../../redux/store";
import { mockMatchApi, rejectingTrigger, serverError } from "../../test-utils/matchApiMocks";

jest.mock("../api/matchSlice");
jest.mock("../api/stompConnection");

const renderStartScreen = () => {
  window.sessionStorage.clear();
  return render(
    <Provider store={setupStore()}>
      <MemoryRouter>
        <StartScreen />
      </MemoryRouter>
    </Provider>,
  );
};

describe("StartScreen", () => {
  afterEach(() => jest.useRealTimers());

  it("renders the game title as the main heading", () => {
    mockMatchApi();
    renderStartScreen();
    expect(screen.getByRole("heading", { level: 1, name: GAME_TITLE })).toBeInTheDocument();
  });

  it("offers to create or join a match", () => {
    mockMatchApi();
    renderStartScreen();
    expect(screen.getByRole("button", { name: "Create New Match" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join Existing Match" })).toBeInTheDocument();
  });

  it("displays the server's error message for an unknown match ID", async () => {
    mockMatchApi({
      lookUpMatch: rejectingTrigger(serverError(404, "A game with that ID does not exist.")),
    });
    renderStartScreen();
    await userEvent.click(screen.getByRole("button", { name: "Join Existing Match" }));
    await userEvent.type(screen.getByLabelText("Match ID"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Find Match" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A game with that ID does not exist.",
    );
  });

  it("shows the waking-up notice after 2 seconds of a pending request and hides it when it settles", () => {
    jest.useFakeTimers();
    mockMatchApi({ isCreating: true });
    const { rerender } = renderStartScreen();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(2100));
    expect(screen.getByRole("status")).toHaveTextContent(/waking up the server/i);

    mockMatchApi({ isCreating: false });
    rerender(
      <Provider store={setupStore()}>
        <MemoryRouter>
          <StartScreen />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
