import { arrayToRgba } from "./color";

describe("arrayToRgba", () => {
  it("formats an rgb array as an rgba css string", () => {
    expect(arrayToRgba([255, 0, 10])).toBe("rgba(255, 0, 10)");
  });

  it("formats an array that includes alpha", () => {
    expect(arrayToRgba([153, 117, 112, 0.5])).toBe("rgba(153, 117, 112, 0.5)");
  });

  it("returns empty parentheses for an empty array", () => {
    expect(arrayToRgba([])).toBe("rgba()");
  });
});
