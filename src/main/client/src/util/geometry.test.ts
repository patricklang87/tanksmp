import { degreesToRadians, getCoordinatesOnCircle, getYForXInLine } from "./geometry";

describe("degreesToRadians", () => {
  it("converts common angles", () => {
    expect(degreesToRadians(0)).toBe(0);
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
  });
});

describe("getCoordinatesOnCircle", () => {
  const center = { x: 100, y: 200 };

  it("points right at 0 degrees", () => {
    const point = getCoordinatesOnCircle({ center, radius: 15, angle: 0 });
    expect(point.x).toBeCloseTo(115);
    expect(point.y).toBeCloseTo(200);
  });

  it("points up on screen at -90 degrees", () => {
    const point = getCoordinatesOnCircle({ center, radius: 15, angle: -90 });
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(185);
  });

  it("points left at -180 degrees", () => {
    const point = getCoordinatesOnCircle({ center, radius: 15, angle: -180 });
    expect(point.x).toBeCloseTo(85);
    expect(point.y).toBeCloseTo(200);
  });
});

describe("getYForXInLine", () => {
  it("interpolates along a sloped line", () => {
    const y = getYForXInLine({
      point1: { x: 0, y: 100 },
      point2: { x: 50, y: 200 },
      currentX: 25,
    });
    expect(y).toBeCloseTo(150);
  });

  it("extrapolates beyond the end points", () => {
    const y = getYForXInLine({
      point1: { x: 10, y: 10 },
      point2: { x: 20, y: 0 },
      currentX: 30,
    });
    expect(y).toBeCloseTo(-10);
  });

  it("returns the shared height of a flat line", () => {
    const y = getYForXInLine({
      point1: { x: 0, y: 300 },
      point2: { x: 50, y: 300 },
      currentX: 33,
    });
    expect(y).toBe(300);
  });
});
