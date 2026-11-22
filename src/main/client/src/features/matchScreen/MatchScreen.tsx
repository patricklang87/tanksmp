import useMatchScreenProps from "./useMatchScreenProps";
import BattleDisplay from "./battleDisplay/BattleDisplay";
import ControlPanel from "./controlPanel/ControlPanel";
import { useControlPanel } from "./controlPanel/useControlPanel";
import type { Game } from "../../types";

/** The running match. Split out so the control panel hook only runs once the match has loaded. */
const RunningMatch = ({ game }: { game: Game }) => {
  const controlPanel = useControlPanel(game);
  const { playerIndex, turretAngle } = controlPanel;
  // Only the player's own turret follows their local aim.
  const localAim = playerIndex === null ? undefined : { playerIndex, turretAngle };

  return (
    <>
      <BattleDisplay game={game} localAim={localAim} />
      <ControlPanel game={game} controlPanel={controlPanel} />
    </>
  );
};

const MatchScreen = () => {
  const { data: game } = useMatchScreenProps();
  if (!game) return null;
  return <RunningMatch game={game} />;
};

export default MatchScreen;
