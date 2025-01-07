import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// 7:04
// json-server --watch data/db.json --port 8080
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
            query: (playerName) => ({
                url: "/match",
                method: "POST",
                body: { playerName },
            }),
            invalidatesTags: ["Match"],
        }),
        joinMatch: builder.mutation({
            query: ({ playerName, gameId, }) => ({
                url: "/match/join",
                method: "POST",
                body: { playerName, gameId },
            }),
            invalidatesTags: ["Match"]
        }),
        startMatch: builder.mutation({
            query: ({ playerName, gameId, }) => ({
                url: "/match/start",
                method: "POST",
                body: { playerName, gameId },
            }),
            invalidatesTags: ["Match"]
        }),
    }),
});
export const { 
//   useGetMatchesQuery,
useStartMatchMutation, useInitializeMatchMutation, useJoinMatchMutation, } = apiSlice;
