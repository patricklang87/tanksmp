import { matchApi } from "../features/api/matchSlice";
import type { AppDispatch, RootState } from "./store";
import type { Game } from "../types";
import { applyPendingGame, phaseCompleted, replayDiscarded } from "./turnAnimationSlice";

type ReplayThunk = (dispatch: AppDispatch, getState: () => RootState) => void;

const applyToMatchCache =
  (dispatch: AppDispatch, matchId: string) =>
  (game: Game) => {
    dispatch(matchApi.util.updateQueryData("getMatch", matchId, () => game));
  };

/** The battlefield finished the current replay phase: advance, and show the server's game if the replay is over. */
export const completeReplayPhase =
  (matchId: string): ReplayThunk =>
  (dispatch, getState) => {
    dispatch(phaseCompleted());
    applyPendingGame(dispatch, getState, applyToMatchCache(dispatch, matchId));
  };

/** The battlefield went away mid-replay: jump to the newest server game instead of losing it. */
export const discardReplay =
  (matchId: string): ReplayThunk =>
  (dispatch, getState) => {
    dispatch(replayDiscarded());
    applyPendingGame(dispatch, getState, applyToMatchCache(dispatch, matchId));
  };
