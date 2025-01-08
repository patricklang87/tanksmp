import React from "react";
import { SetStateAction, Dispatch } from "react";

const JoinMatch = ({ handleJoinMatchClick, setGameId, setPlayerName } : {
  handleJoinMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  setPlayerName: Dispatch<SetStateAction<string>>;
  setGameId: Dispatch<SetStateAction<string>>;

}) => {
  return (
    <form onSubmit={handleJoinMatchClick}>
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
      <button type="submit">Join</button>
    </form>
  );
};

export default JoinMatch;
