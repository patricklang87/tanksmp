import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

/**
 * Which match this browser tab is in and which seat it holds. Persisted to sessionStorage so a page
 * refresh keeps the seat.
 */
export interface SessionState {
  matchId: string | null;
  playerIndex: number | null;
  playerToken: string | null;
}

export const SESSION_STORAGE_KEY = "tanksmp.session";

export const emptySession: SessionState = {
  matchId: null,
  playerIndex: null,
  playerToken: null,
};

const isNullableOfType = (value: unknown, expectedType: string) =>
  value === null || typeof value === expectedType;

export const loadSession = (): SessionState => {
  try {
    const storedText = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedText) return emptySession;
    const stored: unknown = JSON.parse(storedText);
    if (typeof stored !== "object" || stored === null) return emptySession;
    const { matchId, playerIndex, playerToken } = stored as Record<string, unknown>;
    if (
      !isNullableOfType(matchId, "string") ||
      !isNullableOfType(playerIndex, "number") ||
      !isNullableOfType(playerToken, "string")
    ) {
      return emptySession;
    }
    return {
      matchId: (matchId as string | null) ?? null,
      playerIndex: (playerIndex as number | null) ?? null,
      playerToken: (playerToken as string | null) ?? null,
    };
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the app works without it.
    return emptySession;
  }
};

export const saveSession = (session: SessionState): void => {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // See loadSession: persistence is a convenience, not a requirement.
  }
};

const sessionSlice = createSlice({
  name: "session",
  initialState: loadSession,
  reducers: {
    matchSelected: (state, action: PayloadAction<string>) => {
      state.matchId = action.payload;
      state.playerIndex = null;
      state.playerToken = null;
    },
    seatClaimed: (
      state,
      action: PayloadAction<{ matchId: string; playerIndex: number; playerToken: string }>
    ) => {
      state.matchId = action.payload.matchId;
      state.playerIndex = action.payload.playerIndex;
      state.playerToken = action.payload.playerToken;
    },
    sessionCleared: () => emptySession,
  },
});

export const { matchSelected, seatClaimed, sessionCleared } = sessionSlice.actions;

export const selectMatchId = (state: RootState) => state.session.matchId;
export const selectPlayerIndex = (state: RootState) => state.session.playerIndex;
export const selectPlayerToken = (state: RootState) => state.session.playerToken;

export default sessionSlice.reducer;
