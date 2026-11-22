import { connectToSocket } from "./stompConnection";
import apiSlice from "./apiSlice";
import type {
  Game,
  JoinMatchRequest,
  JoinMatchResponse,
  MatchEvent,
  TurnCommand,
} from "../../types";

const PLAYER_TOKEN_HEADER = "X-Player-Token";

/**
 * The game a broadcast event leaves the match in. Both event types carry the full game, so the
 * cache can simply be replaced. (Replaying a TURN_RESOLVED animation comes with the battlefield.)
 */
export const gameFromMatchEvent = (event: MatchEvent): Game => event.game;

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
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        const stompClient = connectToSocket();
        try {
          await cacheDataLoaded;
          stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/game-progress/${matchId}`, (message) => {
              const matchEvent: MatchEvent = JSON.parse(message.body);
              const updatedGame = gameFromMatchEvent(matchEvent);
              updateCachedData(() => updatedGame);
            });
          });
        } catch {
          // The initial request failed (for example an unknown match ID), so there is nothing to
          // subscribe to; the query itself reports the error.
        }
        await cacheEntryRemoved;
        if (stompClient.connected) {
          stompClient.disconnect(() => undefined);
        }
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
