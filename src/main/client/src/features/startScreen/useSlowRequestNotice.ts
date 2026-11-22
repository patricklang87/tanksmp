import { useEffect, useState } from "react";
import { lobbyConstants } from "../../constants";

/**
 * True once a request has been pending for longer than the delay; false again as soon as it
 * settles. Used to explain cold starts of the free-tier server instead of showing a dead screen.
 */
export const useSlowRequestNotice = (
  isRequestPending: boolean,
  delayMs: number = lobbyConstants.slowRequestNoticeDelayMs
): boolean => {
  const [isNoticeVisible, setIsNoticeVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!isRequestPending) {
      setIsNoticeVisible(false);
      return;
    }
    const timerId = setTimeout(() => setIsNoticeVisible(true), delayMs);
    return () => clearTimeout(timerId);
  }, [isRequestPending, delayMs]);

  return isNoticeVisible;
};
