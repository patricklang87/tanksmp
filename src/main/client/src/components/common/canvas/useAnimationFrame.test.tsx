import { act, renderHook } from "@testing-library/react";
import { useFrameCounter } from "./useAnimationFrame";

describe("useFrameCounter", () => {
  let pendingFrames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;

  const runNextFrame = () => {
    const [frameId, callback] = [...pendingFrames.entries()][0];
    pendingFrames.delete(frameId);
    act(() => callback(0));
  };

  beforeEach(() => {
    pendingFrames = new Map();
    nextFrameId = 1;
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      pendingFrames.set(nextFrameId, callback);
      return nextFrameId++;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation((frameId) => {
      pendingFrames.delete(frameId);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it("does not request frames while inactive", () => {
    const { result } = renderHook(() => useFrameCounter(false));
    expect(result.current).toBe(0);
    expect(pendingFrames.size).toBe(0);
  });

  it("counts one per frame while active", () => {
    const { result } = renderHook(() => useFrameCounter(true));
    runNextFrame();
    runNextFrame();
    runNextFrame();
    expect(result.current).toBe(3);
  });

  it("resets and cancels the loop when it becomes inactive", () => {
    const { result, rerender } = renderHook(({ isActive }) => useFrameCounter(isActive), {
      initialProps: { isActive: true },
    });
    runNextFrame();
    expect(result.current).toBe(1);
    rerender({ isActive: false });
    expect(result.current).toBe(0);
    expect(pendingFrames.size).toBe(0);
  });

  it("cancels the pending frame on unmount", () => {
    const { unmount } = renderHook(() => useFrameCounter(true));
    expect(pendingFrames.size).toBe(1);
    unmount();
    expect(pendingFrames.size).toBe(0);
  });
});
