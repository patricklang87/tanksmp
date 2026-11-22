import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JoinMatch from "./JoinMatch";

const renderJoinMatch = (playerName: string, requestedColor: number | null) =>
  render(
    <JoinMatch
      matchId="match-1"
      claimedColors={["", "", "", "", "", ""]}
      playerName={playerName}
      onPlayerNameChange={jest.fn()}
      requestedColor={requestedColor}
      onRequestedColorChange={jest.fn()}
      onSubmit={jest.fn()}
      onBack={jest.fn()}
      isJoining={false}
    />
  );

describe("JoinMatch", () => {
  it("disables Join until the name has 3 characters and a color is selected", () => {
    const { rerender } = renderJoinMatch("Al", null);
    const joinButton = () => screen.getByRole("button", { name: "Join" });
    expect(joinButton()).toBeDisabled();

    const props = {
      matchId: "match-1",
      playerName: "Al",
      onPlayerNameChange: jest.fn(),
      onRequestedColorChange: jest.fn(),
      onSubmit: jest.fn(),
      onBack: jest.fn(),
      isJoining: false,
    };
    rerender(<JoinMatch {...props} playerName="Ada" requestedColor={null} />);
    expect(joinButton()).toBeDisabled();

    rerender(<JoinMatch {...props} playerName="Al" requestedColor={2} />);
    expect(joinButton()).toBeDisabled();

    rerender(<JoinMatch {...props} playerName="Ada" requestedColor={2} />);
    expect(joinButton()).toBeEnabled();
  });

  it("does not count surrounding spaces toward the name length", () => {
    renderJoinMatch("  A ", 1);
    expect(screen.getByRole("button", { name: "Join" })).toBeDisabled();
  });

  it("reports typing in the name field", async () => {
    const onPlayerNameChange = jest.fn();
    render(
      <JoinMatch
        matchId="match-1"
        playerName=""
        onPlayerNameChange={onPlayerNameChange}
        requestedColor={null}
        onRequestedColorChange={jest.fn()}
        onSubmit={jest.fn()}
        onBack={jest.fn()}
        isJoining={false}
      />
    );
    await userEvent.type(screen.getByLabelText(/enter player name/i), "B");
    expect(onPlayerNameChange).toHaveBeenCalledWith("B");
  });
});
