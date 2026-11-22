import useMatchScreenProps from "./useMatchScreenProps";
import BattleDisplay from "./battleDisplay/BattleDisplay";

const MatchScreen = () => {
  const { data: game } = useMatchScreenProps();
  if (!game) return null;
  return <BattleDisplay game={game} />;
};

export default MatchScreen;
