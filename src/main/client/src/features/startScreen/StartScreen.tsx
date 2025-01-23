import { useEffect } from "react";
import { useStartScreenProps } from "./startScreenProps";
import IsTruthy from "../../components/common/logic/IsTruthy";
import JoinMatch from "./JoinMatch";
import SubscribeMatch from "./SubscribeMatch";
import "./startScreen.css";
import StartOrJoin from "./CreateOrJoin";

const StartScreen = () => {
  const {
    handleInitializeMatchClick,
    handleJoinMatchClick,
    handleSubscribeMatchClick,
    handleStartMatchClick,
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setPlayerName,
    setRequestedColor,
    requestedColor,
    setGameId,
    playerName,
    gameId,
    isGameCreator,
    selectedPage,
    setSelectedPage,
    joinedMatch,
  } = useStartScreenProps();

  useEffect(() => {
    console.log("start data", data);
  }, [data]);

  return (
    <>
      <h1 className="title-card">Tanks fer Nuthin'!</h1>

      <IsTruthy value={selectedPage === 1}>
        <StartOrJoin
          setSelectedPage={setSelectedPage}
          isError={isError}
          isSuccess={isSuccess}
          isLoading={isLoading}
          error={error}
          handleInitializeMatchClick={handleInitializeMatchClick}
        />
      </IsTruthy>

      <IsTruthy value={selectedPage === 3}>
        <SubscribeMatch
          handleSubscribeMatchClick={handleSubscribeMatchClick}
          setGameId={setGameId}
          gameId={gameId}
          isGameCreator={isGameCreator}
        />
      </IsTruthy>

      <IsTruthy value={selectedPage === 4}>
        <JoinMatch
          setGameId={setGameId}
          setPlayerName={setPlayerName}
          handleJoinMatchClick={handleJoinMatchClick}
          handleStartMatchClick={handleStartMatchClick}
          playerName={playerName}
          requestedColor={requestedColor}
          gameId={gameId}
          data={data}
          setRequestedColor={setRequestedColor}
          joinedMatch={joinedMatch}
          isGameCreator={isGameCreator}
        />
      </IsTruthy>
    </>
  );
};

export default StartScreen;
