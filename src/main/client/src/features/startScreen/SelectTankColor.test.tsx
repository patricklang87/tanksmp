import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectTankColor from "./SelectTankColor";

const renderSelector = (claimedColors?: (string | undefined)[], requestedColor: number | null = null) => {
  const setRequestedColor = jest.fn();
  const { container } = render(
    <SelectTankColor
      data={claimedColors ? { claimedColors } : undefined}
      setRequestedColor={setRequestedColor}
      requestedColor={requestedColor}
    />
  );
  const swatches = Array.from(container.querySelectorAll<HTMLElement>(".tank-color-option"));
  return { swatches, setRequestedColor };
};

describe("SelectTankColor", () => {
  it("renders the heading and six color swatches", () => {
    const { swatches } = renderSelector();
    expect(screen.getByText("Select Tank Color")).toBeInTheDocument();
    expect(swatches).toHaveLength(6);
  });

  it("requests the clicked color when it is unclaimed", async () => {
    const { swatches, setRequestedColor } = renderSelector();
    await userEvent.click(swatches[2]);
    expect(setRequestedColor).toHaveBeenCalledWith(2);
  });

  it("shows the claiming player's name and ignores clicks on claimed swatches", async () => {
    const { swatches, setRequestedColor } = renderSelector(["Ada", undefined, undefined]);
    expect(swatches[0]).toHaveTextContent("Ada");
    await userEvent.click(swatches[0]);
    expect(setRequestedColor).not.toHaveBeenCalled();
    await userEvent.click(swatches[1]);
    expect(setRequestedColor).toHaveBeenCalledWith(1);
  });
});
