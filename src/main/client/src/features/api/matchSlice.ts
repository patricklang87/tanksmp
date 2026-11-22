import { subscribeToMatchEvents } from "./matchEventSubscription";
import type { RootState } from "../../redux/store";
import apiSlice from "./apiSlice";
import type {
  Game,
  JoinMatchRequest,
  JoinMatchResponse,
  TurnCommand,
} from "../../types";

const PLAYER_TOKEN_HEADER = "X-Player-Token";

type PlayerAuthorizedRequest = { matchId: string; playerToken: string };

export const matchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMatch: builder.mutation<Game, void>({
      query: () => ({ url: "/matches", method: "POST" }),
    }),
    getMatch: builder.query<Game, string>({
      query: (matchId) => `/matches/${matchId}`,
      async onCacheEntryAdded(
        matchId,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData, dispatch, getState }
      ) {
        await subscribeToMatchEvents(matchId, {
          cacheDataLoaded,
          cacheEntryRemoved,
          dispatch,
          getState: () => getState() as RootState,
          applyGame: (game) => updateCachedData(() => game),
          refetchMatch: () =>
            dispatch(
              matchApi.endpoints.getMatch.initiate(matchId, {
                forceRefetch: true,
                subscribe: false,
              })
            ).unwrap(),
        });
      },
    }),
    joinMatch: builder.mutation<
      JoinMatchResponse,
      JoinMatchRequest & { matchId: string }
    >({
      query: ({ matchId, playerName, requestedColor }) => ({
        url: `/matches/${matchId}/players`,
        method: "POST",
        body: { playerName, requestedColor },
      }),
      async onQueryStarted({ matchId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            matchApi.util.updateQueryData("getMatch", matchId, () => data.game)
          );
        } catch {
          // The mutation result carries the error for the caller.
        }
      },
    }),
    startMatch: builder.mutation<Game, PlayerAuthorizedRequest>({
      query: ({ matchId, playerToken }) => ({
        url: `/matches/${matchId}/start`,
        method: "POST",
        headers: { [PLAYER_TOKEN_HEADER]: playerToken },
      }),
      async onQueryStarted({ matchId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(matchApi.util.updateQueryData("getMatch", matchId, () => data));
        } catch {
          // The mutation result carries the error for the caller.
        }
      },
    }),
    submitTurn: builder.mutation<
      Game,
      PlayerAuthorizedRequest & { command: TurnCommand }
    >({
      query: ({ matchId, playerToken, command }) => ({
        url: `/matches/${matchId}/turns`,
        method: "POST",
        headers: { [PLAYER_TOKEN_HEADER]: playerToken },
        body: command,
      }),
    }),
  }),
});

export const {
  useCreateMatchMutation,
  useGetMatchQuery,
  useLazyGetMatchQuery,
  useJoinMatchMutation,
  useStartMatchMutation,
  useSubmitTurnMutation,
} = matchApi;
