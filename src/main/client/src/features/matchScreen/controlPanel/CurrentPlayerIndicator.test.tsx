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

  it("shows another player's live aim in the 0 to 180 degree convention", () => {
    const aimingPlayer = buildPlayer(1, "Grace", 3);
    aimingPlayer.tank.turretAngle = -45;
    aimingPlayer.tank.shotPower = 60;
    render(<CurrentPlayerIndicator currentPlayer={aimingPlayer} isOwnTurn={false} showLiveAim />);
    expect(screen.getByText("Grace is aiming: 135\u00B0, 60% power")).toBeInTheDocument();
  });

  it("says the player is getting ready to drive when Drive is selected", () => {
    const drivingPlayer = buildPlayer(1, "Grace", 3);
    drivingPlayer.tank.selectedAction = "DRIVE";
    render(<CurrentPlayerIndicator currentPlayer={drivingPlayer} isOwnTurn={false} showLiveAim />);
    expect(screen.getByText("Grace is getting ready to drive")).toBeInTheDocument();
  });

  it("hides the aim readout on your own turn and when live aim is not shown", () => {
    const { rerender } = render(<CurrentPlayerIndicator currentPlayer={grace} isOwnTurn showLiveAim />);
    expect(screen.queryByText(/is aiming/)).not.toBeInTheDocument();
    rerender(<CurrentPlayerIndicator currentPlayer={grace} isOwnTurn={false} />);
    expect(screen.queryByText(/is aiming/)).not.toBeInTheDocument();
  });
});
