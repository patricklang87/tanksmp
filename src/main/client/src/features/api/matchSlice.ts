
import { connectToSocket } from "./socket_js";
import apiSlice from "./apiSlice";

// json-server --watch data/db.json --port 8080

// https://wanago.io/2022/01/03/websockets-redux-toolkit-query-typescript/

// https://redux-toolkit.js.org/rtk-query/usage/mutations
// const ws = new WebSocket("ws://localhost:8080/topic/match");
// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket
// https://stackoverflow.com/questions/75593402/react-rtk-query-with-socket-io-connection-behaves-strangely-during-data-update
// figure out how to subscribe to a particular game?

export interface InitializationDto {
  playerName: string;
  requestedColor: number;
  gameId?: string;
}

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializeMatch: builder.query({
      query: () => "/match/initialize",
    }),
    subscribeMatch: builder.query({
      query: (gameId) => `/match/initialize/${gameId}`,
      async onCacheEntryAdded(
        gameId,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        

        const stompClient = connectToSocket();
        try {


          await cacheDataLoaded;

          stompClient.connect([], () => {
            stompClient.subscribe(
              "/topic/game-progress/" + gameId,
              (message) => {
                const recievedMessage = JSON.parse(message.body);
               
                updateCachedData((draft) => {
                  draft.claimedColors = recievedMessage.claimedColors;
                  draft.players = recievedMessage.players;
                })
              }
            );
          });

        } catch (err) {
          console.log("error: ", err);
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        stompClient.disconnect(() => {
          "Disconnecting from Stomp client."
        });
      },
      providesTags: ["Match"],
    }),
    joinMatch: builder.mutation({
      query: ({
        playerName,
        gameId,
        requestedColor,
      }: {
        playerName: string;
        gameId: string;
        requestedColor: number | null;
      }) => ({
        url: "/match/join",
        method: "POST",
        body: { playerName, gameId, requestedColor },
      }),
    }),
    startMatch: builder.mutation({
      query: ({
        playerName,
        gameId,
      }: {
        playerName: string;
        gameId: string;
      }) => ({
        url: "/match/start",
        method: "POST",
        body: { playerName, gameId },
      }),
    }),
  }),
});

export const {
  //   useGetMatchesQuery,
  useStartMatchMutation,
  useJoinMatchMutation,
  useLazyInitializeMatchQuery,
  useLazySubscribeMatchQuery,
} = extendedApiSlice;

// export const getGameId = (state) => state.gameId;
