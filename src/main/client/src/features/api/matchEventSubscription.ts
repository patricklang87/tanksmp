import type { Dispatch } from "@reduxjs/toolkit";
import { connectToSocket, releaseSharedStompClient, setSharedStompClient } from "./stompConnection";
import type { AimUpdate, Game, MatchEvent } from "../../types";
import type { RootState } from "../../redux/store";
import { selectPlayerIndex } from "../../redux/sessionSlice";
import {
  applyPendingGame,
  gameUpdateReceived,
  selectIsReplayInProgress,
  turnEnqueued,
} from "../../redux/turnAnimationSlice";

type MatchEventDependencies = {
  dispatch: Dispatch;
  getState: () => RootState;
  /** Writes a game into the cached match. */
  applyGame: (game: Game) => void;
  /** Writes another player's live aim into the cached match. */
  applyAim: (aim: AimUpdate) => void;
};

/** Copies a live aim onto its player's tank. Changes only the aim, nothing else in the match. */
export const applyAimToGame = (game: Game, aim: AimUpdate): void => {
  const aimingTank = game.players[aim.playerIndex]?.tank;
  if (!aimingTank) return;
  aimingTank.turretAngle = aim.turretAngle;
  aimingTank.shotPower = aim.shotPower;
  aimingTank.selectedAction = aim.selectedActionName;
};

/**
 * Routes a broadcast to the replay queue. A resolved turn is replayed first and its game shown when
 * the replay ends; any other update is shown immediately unless a replay is running. A live aim only
 * patches another player's tank, and is skipped while a replay runs (the replay shows the turn's own
 * aim) and for the local player (whose sliders are the source of truth).
 */
export const handleMatchEvent = (
  matchEvent: MatchEvent,
  { dispatch, getState, applyGame, applyAim }: MatchEventDependencies
): void => {
  if (matchEvent.type === "AIM_UPDATED") {
    const state = getState();
    const isOwnAim = matchEvent.aim.playerIndex === selectPlayerIndex(state);
    if (!isOwnAim && !selectIsReplayInProgress(state)) {
      applyAim(matchEvent.aim);
    }
    return;
  }
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
    setSharedStompClient(stompClient);
    stompClient.subscribe(`/topic/game-progress/${matchId}`, (message) => {
      handleMatchEvent(JSON.parse(message.body) as MatchEvent, eventDependencies);
    });
    // Broadcasts sent before the subscription existed (for example a host starting the match while
    // this client was still connecting) were missed, so catch up once.
    refetchMatch().catch(() => undefined);
  });

  await cacheEntryRemoved;
  entryWasRemoved = true;
  releaseSharedStompClient(stompClient);
  if (stompClient.connected) {
    stompClient.disconnect(() => undefined);
  }
};
