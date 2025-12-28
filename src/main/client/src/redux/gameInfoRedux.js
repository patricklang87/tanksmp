import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    matchId: ""
};
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
export const selectMatchId = (state) => state.gameInfo.matchId;
export default gameInfoSlice.reducer;
