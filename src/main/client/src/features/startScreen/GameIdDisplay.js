import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CopyToClipboard } from "react-copy-to-clipboard";
import IsTruthy from "../../components/common/logic/IsTruthy";
const GameIdDisplay = ({ gameId }) => {
    return (_jsx(IsTruthy, { value: !!gameId, children: _jsx(CopyToClipboard, { onCopy: () => console.log("copied: ", gameId), text: gameId, children: _jsxs(_Fragment, { children: [" ", _jsxs("p", { children: [_jsx("strong", { children: "Joining Game:" }), " ", gameId] }), _jsx("button", { children: "Copy Game ID" })] }) }) }));
};
export default GameIdDisplay;
