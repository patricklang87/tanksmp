import React from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export default function CreateNewMatch({
  handleInitializeMatchClick,
  isLoading,
  isError,
  error,
}: {
  handleInitializeMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
}) {
  return (
    <>
        <form onSubmit={handleInitializeMatchClick}>
          <button type="submit">
            {isLoading ? "Initializing..." : "Create New Match"}
            {isError && <p>Error: {error?.toString()}</p>}
          </button>
        </form>
    </>
  );
}
