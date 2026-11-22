import { throttle } from "./throttle";

describe("throttle", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("runs the first call immediately", () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);
    throttled(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(1);
  });

  it("drops middle calls and sends only the last one when the wait is over", () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);

    throttled(1);
    throttled(2);
    throttled(3);
    throttled(4);
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(4);
  });

  it("sends nothing extra when no call arrived during the wait", () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);
    throttled(1);
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("goes out immediately again once the wait has fully passed", () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);
    throttled(1);
    jest.advanceTimersByTime(100);
    throttled(2);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(2);
  });

  it("spaces out a steady stream of calls by the wait", () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);
    for (let value = 0; value < 30; value += 1) {
      throttled(value);
      jest.advanceTimersByTime(10);
    }
    jest.advanceTimersByTime(200);
    // Leading call plus one trailing call roughly every 100 ms, ending on the final value.
    expect(callback.mock.calls.length).toBeLessThanOrEqual(5);
    expect(callback).toHaveBeenLastCalledWith(29);
  });

  it("cancel drops the pending call", () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);
    throttled(1);
    throttled(2);
    throttled.cancel();
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
