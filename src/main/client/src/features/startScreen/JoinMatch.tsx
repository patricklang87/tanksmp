import type { FormEvent } from "react";
import SelectTankColor from "./SelectTankColor";
import GameIdDisplay from "./GameIdDisplay";
import { lobbyConstants } from "../../constants";

const JoinMatch = ({
  matchId,
  claimedColors,
  playerName,
  onPlayerNameChange,
  requestedColor,
  onRequestedColorChange,
  onSubmit,
  onBack,
  isJoining,
}: {
  matchId: string;
  claimedColors?: readonly (string | undefined)[];
  playerName: string;
  onPlayerNameChange: (playerName: string) => void;
  requestedColor: number | null;
  onRequestedColorChange: (colorIndex: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
  isJoining: boolean;
}) => {
  const hasValidName = playerName.trim().length >= lobbyConstants.minPlayerNameLength;
  const hasSelectedColor = requestedColor !== null;
  const isJoinDisabled = !hasValidName || !hasSelectedColor || isJoining;

  return (
    <>
      <GameIdDisplay gameId={matchId} />
      <SelectTankColor
        claimedColors={claimedColors}
        setRequestedColor={onRequestedColorChange}
        requestedColor={requestedColor}
      />

      <form className="lobby-form" onSubmit={onSubmit}>
        <label className="form-label" htmlFor="playerName">
          <strong>Enter Player Name</strong>
        </label>
        <input
          type="text"
          id="playerName"
          className="form-control"
          maxLength={lobbyConstants.maxPlayerNameLength}
          value={playerName}
          onChange={(event) => onPlayerNameChange(event.target.value)}
        />
        <div className="lobby-form-buttons">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="button-primary" disabled={isJoinDisabled}>
            {isJoining ? "Joining..." : "Join"}
          </button>
        </div>
      </form>
    </>
  );
};

export default JoinMatch;
