import { useId } from "react";
import { MAX_DRIVE_DISTANCE } from "./useControlPanel";

type DriveControlsProps = {
  driveDistance: number;
  disabled: boolean;
  onDriveDistanceChange: (driveDistance: number) => void;
};

const DriveControls = ({ driveDistance, disabled, onDriveDistanceChange }: DriveControlsProps) => {
  const driveInputId = useId();
  return (
    <div className="control-row">
      <label htmlFor={driveInputId} className="control-label">
        Drive distance
      </label>
      <input
        id={driveInputId}
        type="range"
        min={-MAX_DRIVE_DISTANCE}
        max={MAX_DRIVE_DISTANCE}
        value={driveDistance}
        disabled={disabled}
        onChange={(event) => onDriveDistanceChange(Number(event.target.value))}
      />
      <output htmlFor={driveInputId}>{driveDistance}</output>
    </div>
  );
};

export default DriveControls;
