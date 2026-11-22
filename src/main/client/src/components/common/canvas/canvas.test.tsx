import { render, screen } from "@testing-library/react";
import Canvas from "./canvas";

describe("Canvas", () => {
  it("draws with a 2d context and exposes the label", () => {
    const draw = jest.fn();
    render(<Canvas draw={draw} label="Terrain" />);
    expect(screen.getByRole("img", { name: "Terrain" })).toBeInTheDocument();
    expect(draw).toHaveBeenCalledTimes(1);
    expect(draw.mock.calls[0][0]).toBeInstanceOf(CanvasRenderingContext2D);
  });

  it("uses the default board size and accepts overrides", () => {
    const { rerender } = render(<Canvas draw={jest.fn()} label="Layer" />);
    expect(screen.getByRole("img")).toHaveAttribute("width", "1400");
    expect(screen.getByRole("img")).toHaveAttribute("height", "600");
    rerender(<Canvas draw={jest.fn()} label="Layer" width={50} height={20} />);
    expect(screen.getByRole("img")).toHaveAttribute("width", "50");
    expect(screen.getByRole("img")).toHaveAttribute("height", "20");
  });

  it("redraws only when the draw callback changes", () => {
    const firstDraw = jest.fn();
    const secondDraw = jest.fn();
    const { rerender } = render(<Canvas draw={firstDraw} label="Layer" />);
    rerender(<Canvas draw={firstDraw} label="Layer" />);
    expect(firstDraw).toHaveBeenCalledTimes(1);
    rerender(<Canvas draw={secondDraw} label="Layer" />);
    expect(secondDraw).toHaveBeenCalledTimes(1);
  });
});
