import { connectToSocket } from "./socket_js";
import apiSlice from "./apiSlice";
export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        initializeMatch: builder.query({
            query: () => "/match/initialize",
        }),
        subscribeMatch: builder.query({
            query: (gameId) => `/match/initialize/${gameId}`,
            async onCacheEntryAdded(gameId, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
                const stompClient = connectToSocket();
                try {
                    await cacheDataLoaded;
                    stompClient.connect([], () => {
                        stompClient.subscribe("/topic/game-progress/" + gameId, (message) => {
                            const recievedMessage = JSON.parse(message.body);
                            updateCachedData((draft) => {
                                draft.claimedColors = recievedMessage.claimedColors;
                                draft.players = recievedMessage.players;
                            });
                        });
                    });
                }
                catch (err) {
                    console.log("error: ", err);
                }
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved;
                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                stompClient.disconnect(() => {
                    "Disconnecting from Stomp client.";
                });
            },
            providesTags: ["Match"],
        }),
        joinMatch: builder.mutation({
            query: ({ playerName, gameId, requestedColor, }) => ({
                url: "/match/join",
                method: "POST",
                body: { playerName, gameId, requestedColor },
            }),
        }),
        startMatch: builder.mutation({
            query: ({ playerName, gameId, }) => ({
                url: "/match/start",
                method: "POST",
                body: { playerName, gameId },
            }),
        }),
    }),
});
export const { 
//   useGetMatchesQuery,
useStartMatchMutation, useJoinMatchMutation, useLazyInitializeMatchQuery, useLazySubscribeMatchQuery, } = extendedApiSlice;
// export const getGameId = (state) => state.gameId;
