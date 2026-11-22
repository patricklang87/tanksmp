import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WinnerPopup from "./WinnerPopup";
import { buildPlayer } from "../../../test-utils/gameFixtures";

const players = [buildPlayer(0, "Ada", 0), buildPlayer(1, "Grace", 3)];

const renderPopup = (props: Partial<React.ComponentProps<typeof WinnerPopup>> = {}) => {
  const onRematch = jest.fn();
  render(
    <WinnerPopup players={players} winnerIndex={0} isHost={false} onRematch={onRematch} {...props} />
  );
  return { onRematch };
};

describe("WinnerPopup", () => {
  it("renders nothing while the match continues", () => {
    const { container } = render(
      <WinnerPopup players={players} winnerIndex={null} isHost onRematch={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("names the winning player", () => {
    renderPopup({ winnerIndex: 1 });
    expect(screen.getByRole("heading", { name: "Grace wins!" })).toBeInTheDocument();
  });

  it("says nobody wins when every tank is destroyed", () => {
    renderPopup({ winnerIndex: -1 });
    expect(
      screen.getByRole("heading", { name: "Nobody wins — everyone's destroyed" })
    ).toBeInTheDocument();
  });

  it("lets the host start a rematch", async () => {
    const user = userEvent.setup();
    const { onRematch } = renderPopup({ isHost: true });

    await user.click(screen.getByRole("button", { name: "Rematch" }));

    expect(onRematch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Waiting for the host…")).not.toBeInTheDocument();
  });

  it("shows everyone else that the host decides", () => {
    renderPopup({ isHost: false });
    expect(screen.getByText("Waiting for the host…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rematch" })).not.toBeInTheDocument();
  });

  it("offers the host a rematch when nobody survived, and others a wait message", () => {
    const { onRematch } = renderPopup({ winnerIndex: -1, isHost: true });
    expect(screen.getByRole("button", { name: "Rematch" })).toBeEnabled();
    expect(onRematch).not.toHaveBeenCalled();
  });

  it("disables the button while the rematch is being requested and shows an error", () => {
    renderPopup({ isHost: true, isRematching: true, errorMessage: "A rematch failed." });
    expect(screen.getByRole("button", { name: "Rematch" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("A rematch failed.");
  });
});
