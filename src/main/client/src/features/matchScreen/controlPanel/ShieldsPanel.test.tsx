import { render, screen, within } from "@testing-library/react";
import ShieldsPanel from "./ShieldsPanel";
import { buildPlayer } from "../../../test-utils/gameFixtures";

describe("ShieldsPanel", () => {
  it("shows a row with name, color and shields for every player", () => {
    const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];
    players[1].tank.shields = 65;
    render(<ShieldsPanel players={players} />);

    const adaRow = screen.getByTestId("shields-row-0");
    expect(within(adaRow).getByText("Ada")).toBeInTheDocument();
    expect(within(adaRow).getByText("100%")).toBeInTheDocument();
    expect(adaRow).toHaveStyle({ backgroundColor: "rgba(129, 90, 160, 1)" });

    const graceRow = screen.getByTestId("shields-row-1");
    expect(within(graceRow).getByText("65%")).toBeInTheDocument();
    expect(within(graceRow).getByRole("progressbar")).toHaveAttribute("value", "65");
  });

  it("shows Deadzo for a player with no shields left", () => {
    const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];
    players[1].tank.shields = 0;
    render(<ShieldsPanel players={players} />);

    const graceRow = screen.getByTestId("shields-row-1");
    expect(within(graceRow).getByText("Deadzo")).toBeInTheDocument();
    expect(graceRow).toHaveStyle({ backgroundColor: "rgba(153, 117, 112)" });
    expect(screen.getByTestId("shields-row-0")).not.toHaveTextContent("Deadzo");
  });

  it("shows each player's win count", () => {
    const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];
    players[0].wins = 1;
    players[1].wins = 3;
    render(<ShieldsPanel players={players} />);

    expect(within(screen.getByTestId("shields-row-0")).getByText("1 win")).toBeInTheDocument();
    expect(within(screen.getByTestId("shields-row-1")).getByText("3 wins")).toBeInTheDocument();
  });

  it("shows no wins for a player whose count is missing or zero", () => {
    const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];
    players[1].wins = null;
    render(<ShieldsPanel players={players} />);

    expect(within(screen.getByTestId("shields-row-0")).getByText("0 wins")).toBeInTheDocument();
    expect(within(screen.getByTestId("shields-row-1")).getByText("0 wins")).toBeInTheDocument();
  });
});
