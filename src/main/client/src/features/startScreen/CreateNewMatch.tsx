import React from "react";
import { Dispatch, SetStateAction } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import GameIdDisplay from "./GameIdDisplay";

export default function CreateNewMatch({
  handleInitializeMatchClick,
  isLoading,
  data,
  isError,
  error,
}: {
  handleInitializeMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  setPlayerName: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
  data: any; // create data type object and use here
  playerName: string;
  requestedColor: number | null;
}) {
  return (
    <>
        <form onSubmit={handleInitializeMatchClick}>
          <button type="submit" disabled={data?.gameId}>
            {isLoading ? "Initializing..." : "Create"}
            {isError && <p>Error: {error?.toString()}</p>}
          </button>
        </form>
      <GameIdDisplay gameId={data?.gameId} />
    </>
  );
}
