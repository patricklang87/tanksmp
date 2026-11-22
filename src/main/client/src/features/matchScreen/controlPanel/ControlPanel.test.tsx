import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import ControlPanel from "./ControlPanel";
import { useControlPanel } from "./useControlPanel";
import { setupStore } from "../../../redux/store";
import { turnEnqueued } from "../../../redux/turnAnimationSlice";
import { useSubmitTurnMutation } from "../../api/matchSlice";
import { rejectingTrigger, resolvingTrigger, serverError } from "../../../test-utils/matchApiMocks";
import { buildRunningGame, buildTurnResult } from "../../../test-utils/gameFixtures";
import type { Game } from "../../../types";

jest.mock("../../api/matchSlice");
jest.mock("../../api/stompConnection");

const ControlPanelHarness = ({ game }: { game: Game }) => {
  const controlPanel = useControlPanel(game);
  return <ControlPanel game={game} controlPanel={controlPanel} />;
};

const renderControlPanel = ({
  game = buildRunningGame(),
  playerIndex = 0,
  submitTurn = resolvingTrigger({}),
}: {
  game?: Game;
  playerIndex?: number;
  submitTurn?: ReturnType<typeof resolvingTrigger>;
} = {}) => {
  jest.mocked(useSubmitTurnMutation).mockReturnValue([submitTurn, { isLoading: false }] as never);
  const store = setupStore({
    session: { matchId: game.gameId, playerIndex, playerToken: `token-${playerIndex}` },
  });
  const view = render(
    <Provider store={store}>
      <ControlPanelHarness game={game} />
    </Provider>
  );
  return { store, submitTurn, ...view };
};

const fireButton = () => screen.getByRole("button", { name: "Fire!" });
const angleSlider = () => screen.getByLabelText("Turret angle");
const powerSlider = () => screen.getByLabelText("Shot power");

describe("ControlPanel", () => {
  it("enables the controls on your own turn", () => {
    renderControlPanel();
    expect(fireButton()).toBeEnabled();
    expect(angleSlider()).toBeEnabled();
    expect(powerSlider()).toBeEnabled();
    expect(screen.getByRole("combobox", { name: "Action" })).toBeEnabled();
    expect(screen.getByText("Your turn")).toBeInTheDocument();
  });

  it("disables the controls when it is another player's turn", () => {
    renderControlPanel({ playerIndex: 1 });
    expect(fireButton()).toBeDisabled();
    expect(angleSlider()).toBeDisabled();
    expect(powerSlider()).toBeDisabled();
    expect(screen.getByText("Waiting for Ada")).toBeInTheDocument();
  });

  it("disables the controls while a turn is being replayed", () => {
    const { store } = renderControlPanel();
    expect(fireButton()).toBeEnabled();

    act(() => {
      store.dispatch(
        turnEnqueued({
          turnResult: buildTurnResult({ actingPlayerIndex: 1 }),
          resultingGame: buildRunningGame({ turnNumber: 1 }),
        })
      );
    });

    expect(fireButton()).toBeDisabled();
    expect(angleSlider()).toBeDisabled();
  });

  it("disables the controls when the match is not in progress or your tank is destroyed", () => {
    const finishedGame = buildRunningGame({ gameStatus: "FINISHED", winnerIndex: 1 });
    const { unmount } = renderControlPanel({ game: finishedGame });
    expect(fireButton()).toBeDisabled();
    unmount();

    const destroyedTankGame = buildRunningGame();
    destroyedTankGame.players[0].tank.shields = 0;
    renderControlPanel({ game: destroyedTankGame });
    expect(fireButton()).toBeDisabled();
  });

  it("shows the turret angle from 0 to 180 degrees and sends the server's -180 to 0", async () => {
    const user = userEvent.setup();
    const { submitTurn } = renderControlPanel();
    expect(angleSlider()).toHaveValue("90");

    // 0 degrees is the far left.
    fireEvent.change(angleSlider(), { target: { value: "0" } });
    expect(angleSlider()).toHaveValue("0");
    await user.click(fireButton());

    expect(submitTurn).toHaveBeenCalledWith({
      matchId: "match-1",
      playerToken: "token-0",
      command: { actionName: "STANDARD_SHOT", turretAngle: -180, shotPower: 50 },
    });
  });

  it("fires with the chosen angle and power", async () => {
    const user = userEvent.setup();
    const { submitTurn } = renderControlPanel();

    fireEvent.change(angleSlider(), { target: { value: "93" } });
    fireEvent.change(powerSlider(), { target: { value: "100" } });
    await user.click(fireButton());

    expect(submitTurn).toHaveBeenCalledWith({
      matchId: "match-1",
      playerToken: "token-0",
      command: { actionName: "STANDARD_SHOT", turretAngle: -87, shotPower: 100 },
    });
  });

  it("swaps in the drive controls when Drive is selected and submits a drive command", async () => {
    const user = userEvent.setup();
    const { submitTurn } = renderControlPanel();

    await user.selectOptions(screen.getByRole("combobox", { name: "Action" }), "Drive");

    expect(screen.queryByLabelText("Turret angle")).not.toBeInTheDocument();
    const driveSlider = screen.getByLabelText("Drive distance");
    expect(driveSlider).toHaveAttribute("min", "-150");
    expect(driveSlider).toHaveAttribute("max", "150");

    fireEvent.change(driveSlider, { target: { value: "150" } });
    await user.click(screen.getByRole("button", { name: "Drive!" }));

    expect(submitTurn).toHaveBeenCalledWith({
      matchId: "match-1",
      playerToken: "token-0",
      command: { actionName: "DRIVE", driveDistance: 150 },
    });
  });

  it("disables a weapon with no rounds left and falls back to the standard shot", async () => {
    const user = userEvent.setup();
    const game = buildRunningGame();
    game.players[0].tank.remainingRounds = { STEEL_SHOTPUT: 0, BEGEMOT: 1 };
    const { submitTurn } = renderControlPanel({ game });

    expect(screen.getByRole("option", { name: "Steel Shotput" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Begemot" })).toBeEnabled();

    await user.selectOptions(screen.getByRole("combobox", { name: "Action" }), "Begemot");
    expect(screen.getByText("Rounds left: 1")).toBeInTheDocument();
    await user.click(fireButton());
    expect(submitTurn).toHaveBeenCalledWith(
      expect.objectContaining({ command: expect.objectContaining({ actionName: "BEGEMOT" }) })
    );
  });

  it("shows unlimited rounds for the standard shot", () => {
    renderControlPanel();
    expect(screen.getByText("Rounds left: unlimited")).toBeInTheDocument();
  });

  it("shows the server's message when it rejects the turn and keeps the controls usable", async () => {
    const user = userEvent.setup();
    renderControlPanel({
      submitTurn: rejectingTrigger(serverError(409, "It is not your turn.")) as never,
    });

    await user.click(fireButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("It is not your turn.");
    expect(fireButton()).toBeEnabled();
  });

  it("locks the controls after a turn is accepted until the next turn begins", async () => {
    const user = userEvent.setup();
    const game = buildRunningGame();
    const { rerender, store } = renderControlPanel({ game });

    await user.click(fireButton());
    expect(fireButton()).toBeDisabled();

    // The replay finished and the server's next game arrives: it is Grace's turn.
    rerender(
      <Provider store={store}>
        <ControlPanelHarness game={buildRunningGame({ turnNumber: 1, currentPlayerIndex: 1 })} />
      </Provider>
    );
    expect(fireButton()).toBeDisabled();
    expect(screen.getByText("Waiting for Grace")).toBeInTheDocument();

    // ...and it is Ada's turn again two turns later.
    rerender(
      <Provider store={store}>
        <ControlPanelHarness game={buildRunningGame({ turnNumber: 2, currentPlayerIndex: 0 })} />
      </Provider>
    );
    expect(fireButton()).toBeEnabled();
  });
});
