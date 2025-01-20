import React from "react";
import { SetStateAction, Dispatch } from "react";

const SubscribeMatch = ({
  handleSubscribeMatchClick,
  setGameId,
  gameId,
}: {
  handleSubscribeMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  setGameId: Dispatch<SetStateAction<string>>;
  gameId: string;
}) => {
  return (
    <form onSubmit={handleSubscribeMatchClick}>
      <label className="form-label" htmlFor="gameId">
        Game Id:{" "}
      </label>
      <input
        type="text"
        id="gameId"
        className="form-control"
        onChange={(e) => setGameId(e.target.value)}
      />

      <br />
      <button type="submit" disabled={!gameId}>
        Join
      </button>
    </form>
  );
};

export default SubscribeMatch;
