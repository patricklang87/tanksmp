import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import IsTruthy from "../../components/common/logic/IsTruthy";
import { LuCopy } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";
const GameIdDisplay = ({ gameId }) => {
    const [copied, setCopied] = useState(false);
    return (_jsx(IsTruthy, { value: !!gameId, children: _jsxs("div", { className: "game-id-container", children: [_jsx("div", { children: _jsxs("p", { children: [_jsx("strong", { children: "Game Id" }), _jsx("br", {}), gameId] }) }), _jsx("div", { className: "game-id-flex-item", children: _jsx(CopyToClipboard, { onCopy: () => setCopied(true), text: gameId, children: _jsx("button", { children: copied ? _jsx(LuCopyCheck, {}) : _jsx(LuCopy, {}) }) }) })] }) }));
};
export default GameIdDisplay;
