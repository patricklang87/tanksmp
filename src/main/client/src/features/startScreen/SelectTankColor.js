import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tankColor } from "../../constants";
import { arrayToRgba } from "../../util/color";
const SelectTankColor = ({ data, setRequestedColor, requestedColor, }) => {
    const claimedColors = data?.claimedColors || [];
    const TankSelectionSquare = ({ color, takenBy, index, }) => {
        let borderStyle = "outset";
        if (index === requestedColor)
            borderStyle = "inset";
        return (_jsx("div", { onClick: () => setRequestedColor(index), children: _jsx("div", { style: {
                    backgroundColor: arrayToRgba(color),
                    width: "50px",
                    height: "50px",
                    borderStyle,
                }, children: takenBy ? takenBy : "" }) }));
    };
    const availableColors = tankColor.map((color, index) => (_jsx(TankSelectionSquare, { color: color, takenBy: claimedColors[index], index: index }, `tank_color_option_${index}`)));
    // if (data) {
    //     const claimedColors = new Set()
    //     availableColors =
    // }
    return (_jsxs("div", { children: [_jsx("div", { style: {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                }, children: availableColors }), _jsx("p", { children: "Select Tank Color" })] }));
};
export default SelectTankColor;
