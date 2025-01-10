import React from "react";
import { SetStateAction, Dispatch } from "react";

const JoinMatch = ({ handleJoinMatchClick, setGameId, setPlayerName, playerName, requestedColor, gameId } : {
  handleJoinMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  setPlayerName: Dispatch<SetStateAction<string>>;
  setGameId: Dispatch<SetStateAction<string>>;
  playerName: string;
  requestedColor: number | null;
  gameId: string;
}) => {
  let disableJoinButton = false;
  if (playerName.length < 3 || !(typeof requestedColor === "number") || !gameId.length) {
    disableJoinButton = true;
  }

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
      <button type="submit" disabled={disableJoinButton}>Join</button>
    </form>
  );
};

export default JoinMatch;
