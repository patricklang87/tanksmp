import { toDisplayedTurretAngle, toServerTurretAngle } from "./turretAngle";

describe("turret angle mapping", () => {
  it("maps the displayed 0 to 180 degrees onto the server's -180 to 0", () => {
    expect(toServerTurretAngle(0)).toBe(-180);
    expect(toServerTurretAngle(90)).toBe(-90);
    expect(toServerTurretAngle(180)).toBe(0);
  });

  it("maps the server's angles back to the displayed ones", () => {
    expect(toDisplayedTurretAngle(-180)).toBe(0);
    expect(toDisplayedTurretAngle(-90)).toBe(90);
    expect(toDisplayedTurretAngle(0)).toBe(180);
  });

  it("round-trips every displayed angle", () => {
    for (let displayedAngle = 0; displayedAngle <= 180; displayedAngle += 1) {
      expect(toDisplayedTurretAngle(toServerTurretAngle(displayedAngle))).toBe(displayedAngle);
    }
  });
});
