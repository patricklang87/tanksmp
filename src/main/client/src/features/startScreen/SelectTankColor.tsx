import React from "react";
import { SetStateAction, Dispatch } from "react";
import { tankColor } from "../../constants";
import { arrayToRgba } from "../../util/color";

const SelectTankColor = ({
  data,
  setRequestedColor,
  requestedColor,
}: {
  data?: any;
  setRequestedColor: Dispatch<SetStateAction<number | null>>;
  requestedColor: number | null;
}) => {
  const claimedColors = data?.claimedColors || [];

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
