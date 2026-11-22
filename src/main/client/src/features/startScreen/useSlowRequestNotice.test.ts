import { act, renderHook } from "@testing-library/react";
import { useSlowRequestNotice } from "./useSlowRequestNotice";

describe("useSlowRequestNotice", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("stays hidden while a request is quick", () => {
    const { result, rerender } = renderHook(
      ({ isPending }) => useSlowRequestNotice(isPending),
      { initialProps: { isPending: true } }
    );
    act(() => jest.advanceTimersByTime(1900));
    expect(result.current).toBe(false);
    rerender({ isPending: false });
    act(() => jest.advanceTimersByTime(5000));
    expect(result.current).toBe(false);
  });

  it("appears after two seconds pending and disappears once the request settles", () => {
    const { result, rerender } = renderHook(
      ({ isPending }) => useSlowRequestNotice(isPending),
      { initialProps: { isPending: true } }
    );
    act(() => jest.advanceTimersByTime(2100));
    expect(result.current).toBe(true);
    rerender({ isPending: false });
    expect(result.current).toBe(false);
  });

  it("never shows when nothing is pending", () => {
    const { result } = renderHook(() => useSlowRequestNotice(false));
    act(() => jest.advanceTimersByTime(10000));
    expect(result.current).toBe(false);
  });
});
