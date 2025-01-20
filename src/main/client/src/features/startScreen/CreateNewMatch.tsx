import React from "react";
import { Dispatch, SetStateAction } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export default function CreateNewMatch({
  handleInitializeMatchClick,
  isLoading,
  isSuccess,
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
    <form onSubmit={handleInitializeMatchClick}>
      <button type="submit">
        {isLoading ? "Initializing..." : "Create"}
      </button>
      {isSuccess && <p>Game Id: {data.gameId}</p>}
      {isError && <p>Error: {error?.toString()}</p>}
    </form>
  );
}
