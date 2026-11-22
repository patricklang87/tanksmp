import type { Player } from "../../../types";

type WinnerPopupProps = {
  players: Player[];
  /** Null while the match continues; -1 when every tank was destroyed. */
  winnerIndex: number | null;
};

export const WinnerPopup = ({ players, winnerIndex }: WinnerPopupProps) => {
  if (winnerIndex === null) return null;

  const headline =
    winnerIndex === -1
      ? "Nobody wins — everyone's destroyed"
      : `${players[winnerIndex]?.name ?? `Player ${winnerIndex + 1}`} wins!`;

  return (
    <div className="winner-popup-container">
      <div className="winner-popup" role="alertdialog" aria-label="Match result">
        <h1>{headline}</h1>
      </div>
    </div>
  );
};

export default WinnerPopup;
