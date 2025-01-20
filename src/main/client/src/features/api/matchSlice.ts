// import {
//   createEntityAdapter
// } from "@reduxjs/toolkit";
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

// const matchAdapter = createEntityAdapter();
// const initialState = matchAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // getAlbums: builder.query({
    //   query: (page = 1) => `albums?_page=${page}&_limit=10`,
    //   providesTags: ['Albums'],
    // }),
    initializeMatch: builder.query({
      query: () => "/match/initialize",
      // transformResponse: responseData => {
      //     return matchAdapter.setAll(initialState, responseData)
      // }
    }),
    subscribeMatch: builder.query({
      query: (gameId) => `/match/initialize/${gameId}`,
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          const cacheData = await cacheDataLoaded;
          console.log("gameId", cacheData.data.gameId);

          connectToSocket(cacheData.data.gameId , updateCachedData);
          // const listener = (event: MessageEvent) => {
          //   const data = JSON.parse(event.data);
          // if (!isMessage(data) || data.channel !== arg) return;
          // console.log("data receieved", data);

          // updateCachedData((draft) => {
          //   draft.push(data);
          // });
          // };

          // ws.addEventListener("message", listener);
        } catch (err) {
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
        } catch (err) {
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
      invalidatesTags: ["Match"],
    }),
  }),
});

export const {
  //   useGetMatchesQuery,
  useStartMatchMutation,
  useJoinMatchMutation,
  useLazyInitializeMatchQuery,
} = extendedApiSlice;

// export const getGameId = (state) => state.gameId;
