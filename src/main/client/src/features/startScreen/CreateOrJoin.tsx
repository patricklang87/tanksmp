import React from "react";
import { SetStateAction, Dispatch } from "react";
import CreateNewMatch from "./CreateNewMatch";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

const CreateOrJoin = ({
  setSelectedPage,
  isError,
  isSuccess,
  isLoading,
  error,
  handleInitializeMatchClick,
}: {
  setSelectedPage: Dispatch<SetStateAction<number>>;
  handleInitializeMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
}) => {
  return (
    <div>
      <CreateNewMatch
        isError={isError}
        isSuccess={isSuccess}
        isLoading={isLoading}
        error={error}
        handleInitializeMatchClick={handleInitializeMatchClick}
      />
      <button onClick={() => setSelectedPage(3)}>Join Existing Match</button>
    </div>
  );
};

export default CreateOrJoin;
