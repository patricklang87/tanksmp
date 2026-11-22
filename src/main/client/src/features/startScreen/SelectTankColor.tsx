import { tankColor } from "../../constants";
import { arrayToRgba } from "../../util/color";

/** Spoken names for the swatches, in the order of `tankColor`. */
const TANK_COLOR_NAMES: readonly string[] = ["Purple", "Yellow", "Teal", "Orange", "Green", "Pink"];

type TankSelectionSquareProps = {
  color: number[];
  colorName: string;
  /** The name of the player who claimed this color, if anyone did. */
  takenBy?: string;
  isSelected: boolean;
  onSelect: () => void;
};

const TankSelectionSquare = ({
  color,
  colorName,
  takenBy,
  isSelected,
  onSelect,
}: TankSelectionSquareProps) => (
  <button
    type="button"
    className="tank-color-option"
    style={{ backgroundColor: arrayToRgba(color) }}
    aria-pressed={isSelected}
    aria-label={takenBy ? `${colorName} tank, taken by ${takenBy}` : `${colorName} tank`}
    disabled={Boolean(takenBy)}
    onClick={onSelect}
  >
    {takenBy ?? ""}
  </button>
);

const SelectTankColor = ({
  claimedColors = [],
  setRequestedColor,
  requestedColor,
}: {
  /** Per color index: the name of the player who claimed it, or an empty string. */
  claimedColors?: readonly (string | undefined)[];
  setRequestedColor: (colorIndex: number) => void;
  requestedColor: number | null;
}) => (
  <div className="select-tank-color-container">
    <p>
      <strong>Select Tank Color</strong>
    </p>
    <div className="tank-colors-container">
      {tankColor.map((color, colorIndex) => (
        <TankSelectionSquare
          key={`tank_color_option_${colorIndex}`}
          color={color}
          colorName={TANK_COLOR_NAMES[colorIndex]}
          takenBy={claimedColors[colorIndex]}
          isSelected={colorIndex === requestedColor}
          onSelect={() => setRequestedColor(colorIndex)}
        />
      ))}
    </div>
  </div>
);

export default SelectTankColor;
