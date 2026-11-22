import type { Game } from "../../../types";
import ActionSelect from "./ActionSelect";
import CurrentPlayerIndicator from "./CurrentPlayerIndicator";
import DriveControls from "./DriveControls";
import ShieldsPanel from "./ShieldsPanel";
import ShotControls from "./ShotControls";
import "./controlPanel.css";
import { getRoundsLeft } from "./useControlPanel";
import type { ControlPanelState } from "./useControlPanel";

type ControlPanelProps = {
  game: Game;
  controlPanel: ControlPanelState;
};

const ControlPanel = ({ game, controlPanel }: ControlPanelProps) => {
  const {
    ownTank,
    selectedActionName,
    isDriveSelected,
    turretAngle,
    shotPower,
    driveDistance,
    canAct,
    isReplayInProgress,
    errorMessage,
    selectAction,
    setTurretAngle,
    setShotPower,
    setDriveDistance,
    submit,
  } = controlPanel;
  const currentPlayer = game.players[game.currentPlayerIndex];
  const isOwnTurn = controlPanel.playerIndex === game.currentPlayerIndex;

  return (
    <section className="control-panel" aria-label="Control panel">
      {currentPlayer && (
        <CurrentPlayerIndicator
          currentPlayer={currentPlayer}
          isOwnTurn={isOwnTurn}
          showLiveAim={game.gameStatus === "IN_PROGRESS" && !isReplayInProgress}
        />
      )}
      <ShieldsPanel players={game.players} />
      {ownTank && (
        <div className="control-section">
          <ActionSelect
            tank={ownTank}
            selectedActionName={selectedActionName}
            disabled={!canAct}
            onSelect={selectAction}
          />
          {isDriveSelected ? (
            <DriveControls
              driveDistance={driveDistance}
              disabled={!canAct}
              onDriveDistanceChange={setDriveDistance}
            />
          ) : (
            <ShotControls
              turretAngle={turretAngle}
              shotPower={shotPower}
              roundsLeft={getRoundsLeft(ownTank, selectedActionName)}
              disabled={!canAct}
              onTurretAngleChange={setTurretAngle}
              onShotPowerChange={setShotPower}
            />
          )}
          <button type="button" className="fire-button" disabled={!canAct} onClick={submit}>
            {isDriveSelected ? "Drive!" : "Fire!"}
          </button>
          {errorMessage && (
            <p className="control-error" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default ControlPanel;
