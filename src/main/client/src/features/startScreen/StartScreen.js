import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useStartScreenProps } from "./startScreenProps";
import IsTruthy from "../../components/common/logic/IsTruthy";
import IsFalsy from "../../components/common/logic/IsFalsy";
import JoinMatch from "./JoinMatch";
import CreateNewMatch from "./CreateNewMatch";
const StartScreen = () => {
    const { handleInitializeMatchClick, handleJoinMatchClick, data, isLoading, isSuccess, isError, error, setPlayerName, 
    // setRequestedColor,
    setGameId, createNewMatch, setCreateNewMatch, } = useStartScreenProps();
    return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "title-card", children: "Tanks fer Nuthin'!" }), _jsxs("div", { children: [_jsx("button", { onClick: () => setCreateNewMatch(true), children: "Create Match" }), _jsx("button", { onClick: () => setCreateNewMatch(false), children: "Join Match" })] }), _jsx(IsTruthy, { value: createNewMatch, children: _jsx(CreateNewMatch, { setPlayerName: setPlayerName, isError: isError, isSuccess: isSuccess, isLoading: isLoading, data: data, error: error, handleInitializeMatchClick: handleInitializeMatchClick }) }), _jsx(IsFalsy, { value: createNewMatch, children: _jsx(JoinMatch, { setGameId: setGameId, setPlayerName: setPlayerName, handleJoinMatchClick: handleJoinMatchClick }) })] }));
};
export default StartScreen;
