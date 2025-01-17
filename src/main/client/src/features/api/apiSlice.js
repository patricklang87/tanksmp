import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { connectToSocket } from "./socket_js";
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080" }),
    tagTypes: ["Match"],
    endpoints: (builder) => ({
        initializeMatch: builder.mutation({
            query: ({ playerName, requestedColor, }) => ({
                url: "/match/initialize",
                method: "POST",
                body: { playerName, requestedColor },
            }),
            async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    const cacheData = await cacheDataLoaded;
                    console.log("gameId", cacheData.data.gameId);
                    connectToSocket(cacheData.data.gameId);
                    // const listener = (event: MessageEvent) => {
                    //   const data = JSON.parse(event.data);
                    // if (!isMessage(data) || data.channel !== arg) return;
                    // console.log("data receieved", data);
                    // updateCachedData((draft) => {
                    //   draft.push(data);
                    // });
                    // };
                    // ws.addEventListener("message", listener);
                }
                catch (err) {
                    console.log("error: ", err);
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                    // in which case `cacheDataLoaded` will throw
                }
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved;
                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                // ws.close();
            },
            invalidatesTags: ["Match"],
        }),
        joinMatch: builder.mutation({
            query: ({ playerName, gameId, requestedColor, }) => ({
                url: "/match/join",
                method: "POST",
                body: { playerName, gameId, requestedColor },
            }),
            invalidatesTags: ["Match"],
        }),
        startMatch: builder.mutation({
            query: ({ playerName, gameId, }) => ({
                url: "/match/start",
                method: "POST",
                body: { playerName, gameId },
            }),
            invalidatesTags: ["Match"],
        }),
    }),
});
export const { 
//   useGetMatchesQuery,
useStartMatchMutation, useInitializeMatchMutation, useJoinMatchMutation, } = apiSlice;
