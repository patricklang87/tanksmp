import type { Dispatch } from "@reduxjs/toolkit";
import { connectToSocket } from "./stompConnection";
import type { Game, MatchEvent } from "../../types";
import type { RootState } from "../../redux/store";
import {
  applyPendingGame,
  gameUpdateReceived,
  turnEnqueued,
} from "../../redux/turnAnimationSlice";

type MatchEventDependencies = {
  dispatch: Dispatch;
  getState: () => RootState;
  /** Writes a game into the cached match. */
  applyGame: (game: Game) => void;
};

/**
 * Routes a broadcast to the replay queue. A resolved turn is replayed first and its game shown when
 * the replay ends; any other update is shown immediately unless a replay is running.
 */
export const handleMatchEvent = (
  matchEvent: MatchEvent,
  { dispatch, getState, applyGame }: MatchEventDependencies
): void => {
  if (matchEvent.type === "TURN_RESOLVED" && matchEvent.turnResult) {
    dispatch(
      turnEnqueued({ turnResult: matchEvent.turnResult, resultingGame: matchEvent.game })
    );
  } else {
    dispatch(gameUpdateReceived(matchEvent.game));
  }
  applyPendingGame(dispatch, getState, applyGame);
};

type SubscriptionDependencies = MatchEventDependencies & {
  /** Resolves once the initial match request has succeeded, and rejects if it failed or the entry was removed. */
  cacheDataLoaded: Promise<unknown>;
  cacheEntryRemoved: Promise<unknown>;
  /** Fetches the match again and replaces the cached copy. */
  refetchMatch: () => Promise<unknown>;
};

/**
 * Keeps a cached match up to date from the server's broadcasts for as long as the cache entry lives.
 */
export const subscribeToMatchEvents = async (
  matchId: string,
  { cacheDataLoaded, cacheEntryRemoved, refetchMatch, ...eventDependencies }: SubscriptionDependencies
): Promise<void> => {
  try {
    await cacheDataLoaded;
  } catch {
    // The initial request failed (for example an unknown match ID) or the entry was removed
    // already; there is nothing to subscribe to and no connection has been opened.
    return;
  }

  let entryWasRemoved = false;
  const stompClient = connectToSocket();
  stompClient.connect({}, () => {
    if (entryWasRemoved) {
      // The connection finished after the match was no longer being watched.
      stompClient.disconnect(() => undefined);
      return;
    }
    stompClient.subscribe(`/topic/game-progress/${matchId}`, (message) => {
      handleMatchEvent(JSON.parse(message.body) as MatchEvent, eventDependencies);
    });
    // Broadcasts sent before the subscription existed (for example a host starting the match while
    // this client was still connecting) were missed, so catch up once.
    refetchMatch().catch(() => undefined);
  });

  await cacheEntryRemoved;
  entryWasRemoved = true;
  if (stompClient.connected) {
    stompClient.disconnect(() => undefined);
  }
};
