export type ThrottledFunction<Arguments extends unknown[]> = {
  (...callArguments: Arguments): void;
  /** Drops a call that is still waiting to be sent and restarts the wait. */
  cancel: () => void;
};

/**
 * Limits how often `callback` runs. The first call goes out immediately (leading edge); calls that
 * arrive within `waitMilliseconds` of it are held back and only the newest one goes out once the
 * wait is over (trailing edge), so the final value is never lost.
 */
export const throttle = <Arguments extends unknown[]>(
  callback: (...callArguments: Arguments) => void,
  waitMilliseconds: number
): ThrottledFunction<Arguments> => {
  let waitTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingArguments: Arguments | null = null;

  const startWait = () => {
    waitTimer = setTimeout(() => {
      waitTimer = null;
      if (pendingArguments) {
        const trailingArguments = pendingArguments;
        pendingArguments = null;
        callback(...trailingArguments);
        startWait();
      }
    }, waitMilliseconds);
  };

  const throttled = (...callArguments: Arguments) => {
    if (waitTimer === null) {
      callback(...callArguments);
      startWait();
    } else {
      pendingArguments = callArguments;
    }
  };

  throttled.cancel = () => {
    if (waitTimer !== null) clearTimeout(waitTimer);
    waitTimer = null;
    pendingArguments = null;
  };

  return throttled;
};
