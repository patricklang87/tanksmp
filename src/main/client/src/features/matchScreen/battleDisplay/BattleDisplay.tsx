import { useCallback, useEffect } from "react";
import "../../../css/gamescreen.css";
import { canvasConstants, colorSchemes } from "../../../constants";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  selectActiveTurn,
  selectReplayId,
  selectTurnAnimationPhase,
} from "../../../redux/turnAnimationSlice";
import { completeReplayPhase, discardReplay } from "../../../redux/turnReplayThunks";
import type { Game } from "../../../types";
import StaticBackground from "./StaticBackground";
import Clouds from "./clouds/Clouds";
import Topography from "./topography/Topography";
import Tanks from "./tanks/Tanks";
import Projectile from "./projectile/Projectile";
import Explosion from "./explosion/Explosion";
import WinnerPopup from "./WinnerPopup";
import { useRematch } from "./useRematch";
import type { LocalAim } from "./tanks/tankAnimation";

/**
 * The battlefield. It shows the match as the server last confirmed it, and replays each resolved
 * turn (drive, shot, explosion, falling tanks) on top of that before the new state is shown.
 */
const BattleDisplay = ({ game, localAim }: { game: Game; localAim?: LocalAim }) => {
  const dispatch = useAppDispatch();
  const phase = useAppSelector(selectTurnAnimationPhase);
  const activeTurn = useAppSelector(selectActiveTurn);
  const replayId = useAppSelector(selectReplayId);
  const { gameId } = game;
  const { isHost, isRematching, errorMessage, startRematch } = useRematch(game);

  const handlePhaseComplete = useCallback(
    () => dispatch(completeReplayPhase(gameId)),
    [dispatch, gameId]
  );

  // Leaving the screen mid-replay must not lose the server's newest game.
  useEffect(() => () => void dispatch(discardReplay(gameId)), [dispatch, gameId]);

  const colorScheme = colorSchemes[game.colorSchema];
  const craterIsVisible = phase === "EXPLOSION" || phase === "FALLING";
  const displayedTopography =
    activeTurn && craterIsVisible ? activeTurn.topographyAfter : game.topography;

  return (
    <div className="gamescreen">
      <div
        className="canvas-container"
        style={{ height: canvasConstants.height, width: canvasConstants.width }}
      >
        <WinnerPopup
          players={game.players}
          winnerIndex={game.winnerIndex}
          isHost={isHost}
          onRematch={startRematch}
          isRematching={isRematching}
          errorMessage={errorMessage}
        />
        <StaticBackground colorScheme={colorScheme} />
        <Clouds clouds={game.clouds} colorScheme={colorScheme} />
        <Topography topography={displayedTopography} colorScheme={colorScheme} />
        <Tanks
          key={`tanks-${replayId}`}
          players={game.players}
          activeTurn={activeTurn}
          phase={phase}
          onPhaseComplete={handlePhaseComplete}
          localAim={localAim}
        />
        {activeTurn && phase === "PROJECTILE" && (
          <Projectile
            key={`projectile-${replayId}`}
            path={activeTurn.projectilePath}
            onComplete={handlePhaseComplete}
          />
        )}
        {activeTurn && phase === "EXPLOSION" && activeTurn.explosion && (
          <Explosion
            key={`explosion-${replayId}`}
            explosion={activeTurn.explosion}
            onComplete={handlePhaseComplete}
          />
        )}
      </div>
    </div>
  );
};

export default BattleDisplay;
