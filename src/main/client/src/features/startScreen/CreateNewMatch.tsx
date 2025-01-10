import React from "react";
import { Dispatch, SetStateAction } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export default function CreateNewMatch({
  handleInitializeMatchClick,
  setPlayerName,
  isLoading,
  isSuccess,
  data,
  isError,
  error,
  playerName,
  requestedColor,
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
  
  let disableCreateButton = false;
  if (playerName.length < 3 || !(typeof requestedColor === "number") || isLoading) {
    disableCreateButton = true;
  }
  return (
    <form onSubmit={handleInitializeMatchClick}>
      <label className="form-label" htmlFor="playerName">
        Player Name:{" "}
      </label>
      <input
        type="text"
        id="playerName"
        className="form-control"
        maxLength={8}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <br />
      <button type="submit" disabled={disableCreateButton}>
        {isLoading ? "Initializing..." : "Create"}
      </button>
      {isSuccess && <p>Game Id: {data.gameId}</p>}
      {isError && <p>Error: {error?.toString()}</p>}
    </form>
  );
}
