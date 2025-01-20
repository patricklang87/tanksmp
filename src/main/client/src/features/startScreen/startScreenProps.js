import { useState } from "react";
import { useLazyInitializeMatchQuery, useJoinMatchMutation, } from "../api/matchSlice";
export const useStartScreenProps = () => {
    const [playerName, setPlayerName] = useState("");
    const [requestedColor, setRequestedColor] = useState(null);
    const [gameId, setGameId] = useState("");
    const [createNewMatch, setCreateNewMatch] = useState(true);
    const [initializeMatch, { data, isLoading, isSuccess, isError, error }] = useLazyInitializeMatchQuery();
    const [joinMatch, { data: joinMatchData }] = useJoinMatchMutation();
    const handleInitializeMatchClick = async (e) => {
        e.preventDefault();
        try {
            const res = await initializeMatch("null").unwrap();
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
            const res = await joinMatch({
                playerName,
                gameId,
                requestedColor,
            }).unwrap();
            console.log("join", res.data);
        }
        catch (err) {
            console.error("Failed to join match", err);
        }
    };
    return {
        handleInitializeMatchClick,
        handleJoinMatchClick,
        data: data ? data : joinMatchData,
        setPlayerName,
        setGameId,
        setRequestedColor,
        requestedColor,
        createNewMatch,
        setCreateNewMatch,
        playerName,
        gameId,
        isLoading,
        isSuccess,
        isError,
        error,
    };
};
