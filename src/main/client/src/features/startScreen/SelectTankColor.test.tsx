import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectTankColor from "./SelectTankColor";

const renderSelector = (
  claimedColors?: (string | undefined)[],
  requestedColor: number | null = null,
) => {
  const user = userEvent.setup();
  const setRequestedColor = jest.fn();
  render(
    <SelectTankColor
      claimedColors={claimedColors}
      setRequestedColor={setRequestedColor}
      requestedColor={requestedColor}
    />,
  );
  return { user, setRequestedColor };
};

describe("SelectTankColor", () => {
  it("renders the heading and six color swatch buttons", () => {
    renderSelector();
    expect(screen.getByText("Select Tank Color")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });

  it("requests the clicked color when it is unclaimed", async () => {
    const { user, setRequestedColor } = renderSelector();
    await user.click(screen.getByRole("button", { name: "Teal tank" }));
    expect(setRequestedColor).toHaveBeenCalledWith(2);
  });

  it("marks only the requested color as pressed", () => {
    renderSelector(undefined, 3);
    expect(screen.getByRole("button", { name: "Orange tank" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Purple tank" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("disables claimed swatches, shows the claiming player's name and ignores clicks on them", async () => {
    const { user, setRequestedColor } = renderSelector(["Ada", undefined, undefined]);
    const claimedSwatch = screen.getByRole("button", { name: "Purple tank, taken by Ada" });
    expect(claimedSwatch).toBeDisabled();
    expect(claimedSwatch).toHaveTextContent("Ada");
    await user.click(claimedSwatch);
    expect(setRequestedColor).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Yellow tank" }));
    expect(setRequestedColor).toHaveBeenCalledWith(1);
  });
});
