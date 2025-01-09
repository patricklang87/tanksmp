import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// json-server --watch data/db.json --port 8080
// https://wanago.io/2022/01/03/websockets-redux-toolkit-query-typescript/
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080" }),
    tagTypes: ["Match"],
    endpoints: (builder) => ({
        // getMatches: builder.query({
        //     query: () => "/match",
        //     providesTags: ['Match']
        // }),
        initializeMatch: builder.mutation({
            query: ({ playerName, requestedColor, }) => ({
                url: "/match/initialize",
                method: "POST",
                body: { playerName, requestedColor },
            }),
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
