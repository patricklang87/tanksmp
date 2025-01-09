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
    if (index === requestedColor) borderStyle = "inset";
    return (
      <div
        
        onClick={() => setRequestedColor(index)}
      >
        <div
          style={{
            backgroundColor: arrayToRgba(color),
            width: "50px",
            height: "50px",
            borderStyle,
          }}
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
  // if (data) {
  //     const claimedColors = new Set()
  //     availableColors =
  // }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {availableColors}
      </div>

      <p>Select Tank Color</p>
    </div>
  );
};

export default SelectTankColor;
