import { configureStore } from "@reduxjs/toolkit";
import gameInfoReducer from "./gameInfoRedux";
import apiSlice from "../features/api/apiSlice";
const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        gameInfo: gameInfoReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});
export default store;
