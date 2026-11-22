import { render, screen } from "@testing-library/react";
import WinnerPopup from "./WinnerPopup";
import { buildPlayer } from "../../../test-utils/gameFixtures";

const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];

describe("WinnerPopup", () => {
  it("renders nothing while the match continues", () => {
    const { container } = render(<WinnerPopup players={players} winnerIndex={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("names the winning player", () => {
    render(<WinnerPopup players={players} winnerIndex={1} />);
    expect(screen.getByRole("heading", { name: "Grace wins!" })).toBeInTheDocument();
  });

  it("says nobody wins when every tank is destroyed", () => {
    render(<WinnerPopup players={players} winnerIndex={-1} />);
    expect(
      screen.getByRole("heading", { name: "Nobody wins — everyone's destroyed" })
    ).toBeInTheDocument();
  });

  it("does not offer a rematch yet", () => {
    render(<WinnerPopup players={players} winnerIndex={0} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
