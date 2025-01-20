import React from "react";
import { SetStateAction, Dispatch } from "react";
import SelectTankColor from "./SelectTankColor";

const JoinMatch = ({ handleJoinMatchClick, setPlayerName, playerName, requestedColor, gameId, data, setRequestedColor } : {
  handleJoinMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  setPlayerName: Dispatch<SetStateAction<string>>;
  setGameId: Dispatch<SetStateAction<string>>;
  setRequestedColor: Dispatch<SetStateAction<number | null>>;
  playerName: string;
  requestedColor: number | null;
  gameId: string;
  data: any;
}) => {
  let disableJoinButton = false;
  if (playerName.length < 3 || !(typeof requestedColor === "number") || !gameId.length) {
    disableJoinButton = true;
  }

  return (
<>
    <SelectTankColor
    data={data}
    setRequestedColor={setRequestedColor}
    requestedColor={requestedColor}
  />
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
      <button type="submit" disabled={disableJoinButton}>Join</button>
      </form>
      </>
  );
};

export default JoinMatch;
