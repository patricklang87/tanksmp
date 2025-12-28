import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface GameInfoState{
  matchId: string;
}

const initialState: GameInfoState = {
  matchId: ""
}

const gameInfoSlice = createSlice({
  name: "gameInfo",
  initialState,
  reducers: {
    setMatchId: (state, action) => {
      state.matchId = action.payload;
    },
  },
});

export const { setMatchId } = gameInfoSlice.actions;
export const selectMatchId = (state : RootState) => state.gameInfo.matchId;

export default gameInfoSlice.reducer;
