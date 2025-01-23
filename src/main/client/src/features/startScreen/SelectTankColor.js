import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tankColor } from "../../constants";
import { arrayToRgba } from "../../util/color";
const SelectTankColor = ({ data, setRequestedColor, requestedColor, }) => {
    const claimedColors = data?.claimedColors || [];
    const TankSelectionSquare = ({ color, takenBy, index, }) => {
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
        return (_jsx("div", { onClick: () => {
                if (!takenBy) {
                    setRequestedColor(index);
                }
            }, children: _jsx("div", { style: {
                    backgroundColor: arrayToRgba(color),
                    borderStyle,
                    borderColor,
                }, className: "tank-color-option", children: takenBy ? takenBy : "" }) }));
    };
    const availableColors = tankColor.map((color, index) => (_jsx(TankSelectionSquare, { color: color, takenBy: claimedColors[index], index: index }, `tank_color_option_${index}`)));
    return (_jsxs("div", { className: "select-tank-color-container", children: [_jsx("p", { children: _jsx("strong", { children: "Select Tank Color" }) }), _jsx("div", { className: "tank-colors-container", children: availableColors })] }));
};
export default SelectTankColor;
