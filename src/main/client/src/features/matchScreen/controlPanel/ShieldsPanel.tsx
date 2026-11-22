import { designConstants, tankColor } from "../../../constants";
import type { Player } from "../../../types";
import { arrayToRgba } from "../../../util/color";

type ShieldsPanelProps = { players: Player[] };

/** One row per player: color, name and remaining shields. */
const ShieldsPanel = ({ players }: ShieldsPanelProps) => (
  <ul className="shields-panel" aria-label="Shields">
    {players.map((player) => {
      const { shields, colorIndex } = player.tank;
      const isDestroyed = shields <= 0;
      const rowColor = arrayToRgba(
        isDestroyed ? designConstants.destroyedTankColor : tankColor[colorIndex]
      );
      return (
        <li
          key={player.playerIndex}
          className="shields-row"
          data-testid={`shields-row-${player.playerIndex}`}
          style={{ backgroundColor: rowColor }}
        >
          <span className="shields-player-name">{player.name}</span>
          <span className="shields-value">{isDestroyed ? "Deadzo" : `${shields}%`}</span>
          <progress
            max={100}
            value={Math.max(0, shields)}
            aria-label={`${player.name} shields`}
          />
        </li>
      );
    })}
  </ul>
);

export default ShieldsPanel;
