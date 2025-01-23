import React from "react";
import { SetStateAction, Dispatch } from "react";
import SelectTankColor from "./SelectTankColor";
import GameIdDisplay from "./GameIdDisplay";
import IsFalsy from "../../components/common/logic/IsFalsy";
import IsTruthy from "../../components/common/logic/IsTruthy";

const JoinMatch = ({
  handleJoinMatchClick,
  handleStartMatchClick,
  setPlayerName,
  playerName,
  requestedColor,
  gameId,
  data,
  setRequestedColor,
  joinedMatch,
  isGameCreator,
}: {
  handleJoinMatchClick: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleStartMatchClick: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setPlayerName: Dispatch<SetStateAction<string>>;
  setGameId: Dispatch<SetStateAction<string>>;
  setRequestedColor: Dispatch<SetStateAction<number | null>>;
  joinedMatch: boolean;
  playerName: string;
  requestedColor: number | null;
  gameId: string;
  data: any;
  isGameCreator: boolean;
}) => {
  let disableJoinButton = false;
  if (
    playerName.length < 3 ||
    !(typeof requestedColor === "number") ||
    !gameId.length
  ) {
    disableJoinButton = true;
  }

  return (
    <>
      <GameIdDisplay gameId={data?.gameId} />
      <SelectTankColor
        data={data}
        setRequestedColor={setRequestedColor}
        requestedColor={requestedColor}
      />

      <IsFalsy value={joinedMatch}>
        <form onSubmit={handleJoinMatchClick}>
          <label className="form-label" htmlFor="playerName">
            <strong>Enter Player Name</strong>
            <br />
          </label>

          <input
            type="text"
            id="playerName"
            className="form-control"
            maxLength={8}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <br />
          <button type="submit" disabled={disableJoinButton}>
            Join
          </button>
        </form>
      </IsFalsy>
      <IsTruthy value={joinedMatch}>
        <IsFalsy value={isGameCreator}>
          <p>Awaiting match start...</p>
        </IsFalsy>
        <IsTruthy value={isGameCreator}>
          <form onSubmit={handleStartMatchClick}>
            <button type="submit">Start Game</button>
          </form>
        </IsTruthy>
      </IsTruthy>
    </>
  );
};

export default JoinMatch;
