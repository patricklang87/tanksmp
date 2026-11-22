import { tankColor } from "../../constants";
import { arrayToRgba } from "../../util/color";

const SelectTankColor = ({
  claimedColors = [],
  setRequestedColor,
  requestedColor,
}: {
  /** Per color index: the name of the player who claimed it, or an empty string. */
  claimedColors?: readonly (string | undefined)[];
  setRequestedColor: (colorIndex: number) => void;
  requestedColor: number | null;
}) => {

  const TankSelectionSquare = ({
    color,
    takenBy,
    index,
  }: {
    color: number[];
    takenBy?: string;
    index: number;
  }) => {
    let borderStyle = "outset";
    let borderColor = "yellow";
    if (index === requestedColor) {
      borderStyle = "inset";
      borderColor = "blue";
    }
    if (takenBy) {
      borderStyle = "inset";
      borderColor = "lightgrey";
    }
    return (
      <div onClick={() => {
        if (!takenBy) {
          setRequestedColor(index)
        }
      }}>
        <div
          style={{
            backgroundColor: arrayToRgba(color),
            borderStyle,
            borderColor,
          }}
          className="tank-color-option"
        >
          {takenBy ? takenBy : ""}
        </div>
      </div>
    );
  };

  const availableColors = tankColor.map((color, index) => (
    <TankSelectionSquare
      key={`tank_color_option_${index}`}
      color={color}
      takenBy={claimedColors[index]}
      index={index}
    />
  ));

  return (
    <div className="select-tank-color-container">
      <p>
        <strong>Select Tank Color</strong>
      </p>
      <div
        className="tank-colors-container"
      >
        {availableColors}
      </div>
    </div>
  );
};

export default SelectTankColor;
