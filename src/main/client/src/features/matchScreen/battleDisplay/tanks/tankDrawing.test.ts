import { tankColor, tankDimensions } from "../../../../constants";
import {
  calculateTurretEndpoints,
  drawTank,
  drawTanks,
} from "./tankDrawing";

describe("calculateTurretEndpoints", () => {
  const tankPosition = { x: 100, y: 200 };

  it("starts at the middle of the tank's top edge", () => {
    const { startingPoint } = calculateTurretEndpoints({ tankPosition, turretAngle: -90 });
    expect(startingPoint).toEqual({ x: 100 + tankDimensions.width / 2, y: 200 });
  });

  it("points straight up at -90 degrees", () => {
    const { startingPoint, endingPoint } = calculateTurretEndpoints({
      tankPosition,
      turretAngle: -90,
    });
    expect(endingPoint.x).toBeCloseTo(startingPoint.x);
    expect(endingPoint.y).toBeCloseTo(startingPoint.y - tankDimensions.turretLength);
  });

  it("points right at 0 degrees and left at -180 degrees", () => {
    const right = calculateTurretEndpoints({ tankPosition, turretAngle: 0 });
    expect(right.endingPoint.x).toBeCloseTo(right.startingPoint.x + tankDimensions.turretLength);
    const left = calculateTurretEndpoints({ tankPosition, turretAngle: -180 });
    expect(left.endingPoint.x).toBeCloseTo(left.startingPoint.x - tankDimensions.turretLength);
  });

  it("scales the turret with the factor", () => {
    const { startingPoint, endingPoint } = calculateTurretEndpoints({
      tankPosition,
      turretAngle: 0,
      factor: 2,
    });
    expect(startingPoint.x).toBe(100 + tankDimensions.width);
    expect(endingPoint.x - startingPoint.x).toBeCloseTo(tankDimensions.turretLength * 2);
  });
});

describe("drawTank", () => {
  const sprite = {
    position: { x: 100, y: 200 },
    color: tankColor[0],
    shields: 100,
    turretAngle: -90,
  };

  it("fills the body with the tank color", () => {
    const context = document.createElement("canvas").getContext("2d")!;
    drawTank(context, sprite);
    expect(context.fillRect).toHaveBeenCalledWith(
      100,
      200,
      tankDimensions.width,
      tankDimensions.height
    );
    expect(context.strokeStyle).toBe("#815aa0");
  });

  it("draws a destroyed tank in the wreck color", () => {
    const context = document.createElement("canvas").getContext("2d")!;
    drawTank(context, { ...sprite, shields: 0 });
    expect(context.strokeStyle).toBe("#997570");
  });

  it("clears the canvas once before drawing all tanks", () => {
    const context = document.createElement("canvas").getContext("2d")!;
    drawTanks(context, [sprite, { ...sprite, position: { x: 300, y: 200 } }]);
    expect(context.clearRect).toHaveBeenCalledTimes(1);
    expect(context.fillRect).toHaveBeenCalledTimes(2);
  });
});
