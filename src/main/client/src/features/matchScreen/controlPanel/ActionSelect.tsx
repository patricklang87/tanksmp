import type { Tank, TankActionName } from "../../../types";
import { getActions, hasRoundsLeft } from "./useControlPanel";

type ActionSelectProps = {
  tank: Tank;
  selectedActionName: TankActionName;
  disabled: boolean;
  onSelect: (actionName: TankActionName) => void;
};

/** Chooses between the weapons and driving; a weapon with no rounds left cannot be picked. */
const ActionSelect = ({ tank, selectedActionName, disabled, onSelect }: ActionSelectProps) => (
  <label className="control-row">
    <span className="control-label">Action</span>
    <select
      value={selectedActionName}
      disabled={disabled}
      onChange={(event) => onSelect(event.target.value as TankActionName)}
    >
      {getActions(tank).map((action) => (
        <option
          key={action.name}
          value={action.name}
          disabled={!hasRoundsLeft(tank, action.name)}
        >
          {action.displayName}
        </option>
      ))}
    </select>
  </label>
);

export default ActionSelect;
