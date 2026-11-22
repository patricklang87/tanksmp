import { useId } from "react";
import {
  MAX_DISPLAYED_TURRET_ANGLE,
  MIN_DISPLAYED_TURRET_ANGLE,
  toDisplayedTurretAngle,
  toServerTurretAngle,
} from "./turretAngle";
import { MAX_SHOT_POWER, MIN_SHOT_POWER } from "./useControlPanel";

type ShotControlsProps = {
  /** In the server's convention, -180 (left) to 0 (right). */
  turretAngle: number;
  shotPower: number;
  /** Null when the selected weapon can be used without limit. */
  roundsLeft: number | null;
  disabled: boolean;
  onTurretAngleChange: (serverTurretAngle: number) => void;
  onShotPowerChange: (shotPower: number) => void;
};

const ShotControls = ({
  turretAngle,
  shotPower,
  roundsLeft,
  disabled,
  onTurretAngleChange,
  onShotPowerChange,
}: ShotControlsProps) => {
  const turretAngleInputId = useId();
  const shotPowerInputId = useId();
  const displayedAngle = toDisplayedTurretAngle(turretAngle);

  return (
    <div className="shot-controls">
      <div className="control-row">
        <label htmlFor={turretAngleInputId} className="control-label">
          Turret angle
        </label>
        <input
          id={turretAngleInputId}
          type="range"
          min={MIN_DISPLAYED_TURRET_ANGLE}
          max={MAX_DISPLAYED_TURRET_ANGLE}
          value={displayedAngle}
          disabled={disabled}
          onChange={(event) =>
            onTurretAngleChange(toServerTurretAngle(Number(event.target.value)))
          }
        />
        <output htmlFor={turretAngleInputId}>{displayedAngle}&deg;</output>
      </div>
      <div className="control-row">
        <label htmlFor={shotPowerInputId} className="control-label">
          Shot power
        </label>
        <input
          id={shotPowerInputId}
          type="range"
          min={MIN_SHOT_POWER}
          max={MAX_SHOT_POWER}
          value={shotPower}
          disabled={disabled}
          onChange={(event) => onShotPowerChange(Number(event.target.value))}
        />
        <output htmlFor={shotPowerInputId}>{shotPower}%</output>
      </div>
      <p className="rounds-left">Rounds left: {roundsLeft === null ? "unlimited" : roundsLeft}</p>
    </div>
  );
};

export default ShotControls;
