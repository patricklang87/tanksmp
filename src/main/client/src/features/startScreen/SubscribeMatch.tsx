import React from "react";
import { SetStateAction, Dispatch } from "react";
import GameIdDisplay from "./GameIdDisplay";
import IsFalsy from "../../components/common/logic/IsFalsy";
import IsTruthy from "../../components/common/logic/IsTruthy";

const SubscribeMatch = ({
  handleSubscribeMatchClick,
  setGameId,
  gameId,
  isGameCreator,
}: {
  handleSubscribeMatchClick: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  setGameId: Dispatch<SetStateAction<string>>;
  gameId: string;
  isGameCreator: boolean;
}) => {
  return (
    <>
      <IsTruthy value={isGameCreator}>
        <GameIdDisplay gameId={gameId} />
      </IsTruthy>
      <form onSubmit={handleSubscribeMatchClick}>
        <IsFalsy value={isGameCreator}>
          <div>
            <label className="form-label" htmlFor="gameId">
              Game Id:{" "}
            </label>
            <input
              type="text"
              id="gameId"
              className="form-control"
              onChange={(e) => setGameId(e.target.value)}
            />
          </div>
        </IsFalsy>
        <br />
        <button type="submit" disabled={!gameId}>
          Subscribe
        </button>
      </form>
    </>
  );
};

export default SubscribeMatch;
