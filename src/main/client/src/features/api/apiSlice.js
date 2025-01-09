import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
                console.log("arg", arg);
                const ws = new WebSocket("ws://localhost:8080/topic/match");
                console.log("ws attempt", ws);
                try {
                    await cacheDataLoaded;
                    const listener = (event) => {
                        const data = JSON.parse(event.data);
                        // if (!isMessage(data) || data.channel !== arg) return;
                        console.log("data receieved", data);
                        // updateCachedData((draft) => {
                        //   draft.push(data);
                        // });
                    };
                    ws.addEventListener("message", listener);
                }
                catch (err) {
                    console.log("Error: ", err);
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                    // in which case `cacheDataLoaded` will throw
                }
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved;
                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                ws.close();
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
