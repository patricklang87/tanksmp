import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { useStartScreenProps } from "./startScreenProps";
import IsTruthy from "../../components/common/logic/IsTruthy";
import IsFalsy from "../../components/common/logic/IsFalsy";
import JoinMatch from "./JoinMatch";
import CreateNewMatch from "./CreateNewMatch";
import SubscribeMatch from "./SubscribeMatch";
const StartScreen = () => {
    const { handleInitializeMatchClick, handleJoinMatchClick, handleSubscribeMatchClick, data, isLoading, isSuccess, isError, error, setPlayerName, setRequestedColor, requestedColor, setGameId, createNewMatch, setCreateNewMatch, playerName, gameId, subscribed, isGameCreator, } = useStartScreenProps();
    useEffect(() => {
        console.log("start data", data);
    }, [data]);
    return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "title-card", children: "Tanks fer Nuthin'!" }), _jsxs("div", { children: [_jsx("button", { onClick: () => setCreateNewMatch(true), children: "Create Match" }), _jsx("button", { onClick: () => setCreateNewMatch(false), children: "Join Match" })] }), _jsxs(IsFalsy, { value: subscribed, children: [_jsx(IsTruthy, { value: createNewMatch, children: _jsx(CreateNewMatch, { setPlayerName: setPlayerName, isError: isError, isSuccess: isSuccess, isLoading: isLoading, data: data, error: error, handleInitializeMatchClick: handleInitializeMatchClick, playerName: playerName, requestedColor: requestedColor }) }), _jsx(IsFalsy, { value: createNewMatch, children: _jsx(SubscribeMatch, { handleSubscribeMatchClick: handleSubscribeMatchClick, setGameId: setGameId, gameId: gameId, isGameCreator: isGameCreator }) })] }), _jsx(IsTruthy, { value: subscribed, children: _jsx(JoinMatch, { setGameId: setGameId, setPlayerName: setPlayerName, handleJoinMatchClick: handleJoinMatchClick, playerName: playerName, requestedColor: requestedColor, gameId: gameId, data: data, setRequestedColor: setRequestedColor }) })] }));
};
export default StartScreen;
