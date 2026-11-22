import { getExplosionFrameCount, getExplosionRadius } from "./explosionAnimation";

describe("explosion animation", () => {
  it("grows by the explosion rate per frame", () => {
    expect(getExplosionRadius(0, 10)).toBe(0);
    expect(getExplosionRadius(10, 10)).toBe(5);
  });

  it("peaks at the maximum radius and shrinks back to nothing", () => {
    expect(getExplosionRadius(20, 10)).toBe(10);
    expect(getExplosionRadius(30, 10)).toBe(5);
    expect(getExplosionRadius(40, 10)).toBe(0);
    expect(getExplosionRadius(60, 10)).toBe(0);
  });

  it("takes as many frames as growing and shrinking", () => {
    expect(getExplosionFrameCount(10)).toBe(40);
  });
});
