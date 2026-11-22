import type { FormEvent } from "react";

const EnterMatchId = ({
  matchIdInput,
  onMatchIdInputChange,
  onSubmit,
  onBack,
  isLookingUp,
}: {
  matchIdInput: string;
  onMatchIdInputChange: (matchIdInput: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
  isLookingUp: boolean;
}) => (
  <form className="lobby-form" onSubmit={onSubmit}>
    <label className="form-label" htmlFor="matchId">
      <strong>Match ID</strong>
    </label>
    <input
      type="text"
      id="matchId"
      className="form-control"
      value={matchIdInput}
      onChange={(event) => onMatchIdInputChange(event.target.value)}
    />
    <div className="lobby-form-buttons">
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button
        type="submit"
        className="button-primary"
        disabled={!matchIdInput.trim() || isLookingUp}
      >
        {isLookingUp ? "Looking up..." : "Find Match"}
      </button>
    </div>
  </form>
);

export default EnterMatchId;
