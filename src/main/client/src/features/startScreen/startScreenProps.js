import { useState } from "react";
import { useLazyInitializeMatchQuery, useJoinMatchMutation, useLazySubscribeMatchQuery, } from "../api/matchSlice";
export const useStartScreenProps = () => {
    const [playerName, setPlayerName] = useState("");
    const [requestedColor, setRequestedColor] = useState(null);
    const [gameId, setGameId] = useState("");
    const [createNewMatch, setCreateNewMatch] = useState(true);
    const [isGameCreator, setIsGameCreator] = useState(false);
    const [initializeMatch, { isLoading, isSuccess, isError, error }] = useLazyInitializeMatchQuery();
    const [subscribeMatch, { data }] = useLazySubscribeMatchQuery();
    const [joinMatch] = useJoinMatchMutation();
    const [subscribed, setSubscribed] = useState(false);
    const handleInitializeMatchClick = async (e) => {
        e.preventDefault();
        try {
            const res = await initializeMatch("null").unwrap();
            console.log("initialize", res, res.gameId);
            setPlayerName("");
            setGameId(res?.gameId);
            setCreateNewMatch(false);
            setIsGameCreator(true);
        }
        catch (err) {
            console.error("Failed to initialize match:", err);
        }
    };
    const handleSubscribeMatchClick = async (e) => {
        e.preventDefault();
        // update and replace with subscribe match
        try {
            const res = await subscribeMatch(gameId);
            console.log("subscribe", res.data);
            setSubscribed(true);
        }
        catch (err) {
            console.error("Failed to subscribe to match", err);
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
            console.log("join", res);
        }
        catch (err) {
            console.error("Failed to join match", err);
        }
    };
    return {
        handleInitializeMatchClick,
        handleJoinMatchClick,
        handleSubscribeMatchClick,
        data,
        isLoading,
        isSuccess,
        isError,
        error,
        setPlayerName,
        setGameId,
        setRequestedColor,
        requestedColor,
        createNewMatch,
        setCreateNewMatch,
        playerName,
        gameId,
        subscribed,
        isGameCreator,
    };
};
