import { combineReducers, configureStore } from "@reduxjs/toolkit";
import sessionReducer, { saveSession } from "./sessionSlice";
import turnAnimationReducer from "./turnAnimationSlice";
import apiSlice from "../features/api/apiSlice";

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  session: sessionReducer,
  turnAnimation: turnAnimationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

const store = setupStore();

let lastSavedSession = store.getState().session;
store.subscribe(() => {
  const currentSession = store.getState().session;
  if (currentSession !== lastSavedSession) {
    lastSavedSession = currentSession;
    saveSession(currentSession);
  }
});

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];

export default store;
