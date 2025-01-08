import { useState } from "react";
import { useInitializeMatchMutation, useJoinMatchMutation, } from "../api/apiSlice";
export const useStartScreenProps = () => {
    const [playerName, setPlayerName] = useState("");
    const [requestedColor, setRequestedColor] = useState([0, 0, 0, 0]);
    const [gameId, setGameId] = useState("");
    const [createNewMatch, setCreateNewMatch] = useState(true);
    const [initializeMatch, { data, isLoading, isSuccess, isError, error }] = useInitializeMatchMutation();
    const [joinMatch] = useJoinMatchMutation();
    const handleInitializeMatchClick = async (e) => {
        e.preventDefault();
        try {
            const res = await initializeMatch(playerName).unwrap();
            console.log("initialize", res);
            setPlayerName("");
        }
        catch (err) {
            console.error("Failed to initialize match:", err);
        }
    };
    const handleJoinMatchClick = async (e) => {
        e.preventDefault();
        try {
            const res = await joinMatch({ playerName, gameId, requestedColor });
            console.log("join", res.data);
        }
        catch (err) {
            console.error("Failed to join match", err);
        }
    };
    return {
        handleInitializeMatchClick,
        handleJoinMatchClick,
        data,
        isLoading,
        isSuccess,
        isError,
        error,
        setPlayerName,
        setGameId,
        setRequestedColor,
        createNewMatch,
        setCreateNewMatch,
    };
};
