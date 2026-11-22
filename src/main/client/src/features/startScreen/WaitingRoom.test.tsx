import { render, screen } from "@testing-library/react";
import WaitingRoom from "./WaitingRoom";
import { buildGame, buildPlayer } from "../../test-utils/gameFixtures";

const ada = buildPlayer(0, "Ada", 0);
const grace = buildPlayer(1, "Grace", 3);

const renderWaitingRoom = (players: ReturnType<typeof buildPlayer>[], ownPlayerIndex: number) =>
  render(
    <WaitingRoom
      game={buildGame({ players })}
      ownPlayerIndex={ownPlayerIndex}
      isHost={ownPlayerIndex === 0}
      onStartMatch={jest.fn()}
      isStarting={false}
    />
  );

describe("WaitingRoom", () => {
  it("lists the joined players with their colors", () => {
    renderWaitingRoom([ada, grace], 0);
    expect(screen.getByText(/Ada/)).toBeInTheDocument();
    expect(screen.getByText(/Grace/)).toBeInTheDocument();
    expect(screen.getByTestId("player-color-0")).toHaveStyle({
      backgroundColor: "rgba(129, 90, 160, 1)",
    });
    expect(screen.getByTestId("player-color-1")).toHaveStyle({
      backgroundColor: "rgba(253, 150, 90, 1)",
    });
  });

  it("shows the host a disabled Start button until a second player joins", () => {
    renderWaitingRoom([ada], 0);
    expect(screen.getByRole("button", { name: "Start Game" })).toBeDisabled();
  });

  it("enables Start for the host with two or more players", () => {
    renderWaitingRoom([ada, grace], 0);
    expect(screen.getByRole("button", { name: "Start Game" })).toBeEnabled();
  });

  it("does not show Start to a player who is not the host", () => {
    renderWaitingRoom([ada, grace], 1);
    expect(screen.queryByRole("button", { name: "Start Game" })).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for the host/i)).toBeInTheDocument();
  });
});
