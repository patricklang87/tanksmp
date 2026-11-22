import { render, screen } from "@testing-library/react";
import CurrentPlayerIndicator from "./CurrentPlayerIndicator";
import { buildPlayer } from "../../../test-utils/gameFixtures";

const grace = buildPlayer(1, "Grace", 3);

describe("CurrentPlayerIndicator", () => {
  it("tells the player when it is their turn", () => {
    render(<CurrentPlayerIndicator currentPlayer={grace} isOwnTurn />);
    expect(screen.getByText("Your turn")).toBeInTheDocument();
  });

  it("names the player everyone is waiting for otherwise", () => {
    render(<CurrentPlayerIndicator currentPlayer={grace} isOwnTurn={false} />);
    expect(screen.getByText("Waiting for Grace")).toBeInTheDocument();
    expect(screen.queryByText("Your turn")).not.toBeInTheDocument();
  });

  it("draws the current player's tank", () => {
    render(<CurrentPlayerIndicator currentPlayer={grace} isOwnTurn={false} />);
    const context = (screen.getByRole("img", { name: "Grace's tank" }) as HTMLCanvasElement).getContext("2d")!;
    expect(context.fillRect).toHaveBeenCalled();
  });
});
