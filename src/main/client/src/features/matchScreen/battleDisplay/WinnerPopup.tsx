import type { Player } from "../../../types";

type WinnerPopupProps = {
  players: Player[];
  /** Null while the match continues; -1 when every tank was destroyed. */
  winnerIndex: number | null;
  /** Only the host can start the rematch; everyone else waits. */
  isHost: boolean;
  onRematch: () => void;
  isRematching?: boolean;
  errorMessage?: string | null;
};

export const WinnerPopup = ({
  players,
  winnerIndex,
  isHost,
  onRematch,
  isRematching = false,
  errorMessage = null,
}: WinnerPopupProps) => {
  if (winnerIndex === null) return null;

  const headline =
    winnerIndex === -1
      ? "Nobody wins — everyone's destroyed"
      : `${players[winnerIndex]?.name ?? `Player ${winnerIndex + 1}`} wins!`;

  return (
    <div className="winner-popup-container">
      <div className="winner-popup" role="alertdialog" aria-label="Match result">
        <h1>{headline}</h1>
        {isHost ? (
          <button
            type="button"
            className="button-primary"
            onClick={onRematch}
            disabled={isRematching}
          >
            Rematch
          </button>
        ) : (
          <p className="winner-popup-waiting">Waiting for the host…</p>
        )}
        {errorMessage && (
          <p className="winner-popup-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default WinnerPopup;
