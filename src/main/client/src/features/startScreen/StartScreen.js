import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useStartScreenProps } from "./startScreenProps";
import IsTruthy from "../../components/common/logic/IsTruthy";
import JoinMatch from "./JoinMatch";
import SubscribeMatch from "./SubscribeMatch";
import "./startScreen.css";
import StartOrJoin from "./CreateOrJoin";
const StartScreen = () => {
    const { handleInitializeMatchClick, handleJoinMatchClick, handleSubscribeMatchClick, handleStartMatchClick, data, isLoading, isSuccess, isError, error, setPlayerName, setRequestedColor, requestedColor, setGameId, playerName, gameId, isGameCreator, selectedPage, setSelectedPage, joinedMatch, } = useStartScreenProps();
    useEffect(() => {
        console.log("start data", data);
    }, [data]);
    return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "title-card", children: "Tanks fer Nuthin'!" }), _jsx(IsTruthy, { value: selectedPage === 1, children: _jsx(StartOrJoin, { setSelectedPage: setSelectedPage, isError: isError, isSuccess: isSuccess, isLoading: isLoading, error: error, handleInitializeMatchClick: handleInitializeMatchClick }) }), _jsx(IsTruthy, { value: selectedPage === 3, children: _jsx(SubscribeMatch, { handleSubscribeMatchClick: handleSubscribeMatchClick, setGameId: setGameId, gameId: gameId, isGameCreator: isGameCreator }) }), _jsx(IsTruthy, { value: selectedPage === 4, children: _jsx(JoinMatch, { setGameId: setGameId, setPlayerName: setPlayerName, handleJoinMatchClick: handleJoinMatchClick, handleStartMatchClick: handleStartMatchClick, playerName: playerName, requestedColor: requestedColor, gameId: gameId, data: data, setRequestedColor: setRequestedColor, joinedMatch: joinedMatch, isGameCreator: isGameCreator }) })] }));
};
export default StartScreen;
