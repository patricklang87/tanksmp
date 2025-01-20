import { useStartScreenProps } from "./startScreenProps";
import IsTruthy from "../../components/common/logic/IsTruthy";
import IsFalsy from "../../components/common/logic/IsFalsy";
import JoinMatch from "./JoinMatch";
import CreateNewMatch from "./CreateNewMatch";
import SubscribeMatch from "./SubscribeMatch";

const StartScreen = () => {
  const {
    handleInitializeMatchClick,
    handleJoinMatchClick,
    handleSubscribeMatchClick,
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setPlayerName,
    setRequestedColor,
    requestedColor,
    setGameId,
    createNewMatch,
    setCreateNewMatch,
    playerName,
    gameId,
   
  } = useStartScreenProps();

  return (
    <>
      <h1 className="title-card">Tanks fer Nuthin'!</h1>

      <div>
        <button onClick={() => setCreateNewMatch(true)}>Create Match</button>
        <button onClick={() => setCreateNewMatch(false)}>Join Match</button>
      </div>


      <IsFalsy value={data}>
      <IsTruthy value={createNewMatch}>
        <CreateNewMatch
          setPlayerName={setPlayerName}
          isError={isError}
          isSuccess={isSuccess}
          isLoading={isLoading}
          data={data}
          error={error}
          handleInitializeMatchClick={handleInitializeMatchClick}
          playerName={playerName}
          requestedColor={requestedColor}
        />
      </IsTruthy>

      <IsFalsy value={createNewMatch}>
        <SubscribeMatch
          handleSubscribeMatchClick={handleSubscribeMatchClick}
          setGameId={setGameId}
          gameId={gameId}
          />
          </IsFalsy>
        </IsFalsy>

      <IsTruthy value={data}>
        <JoinMatch
          setGameId={setGameId}
          setPlayerName={setPlayerName}
          handleJoinMatchClick={handleJoinMatchClick}
          playerName={playerName}
          requestedColor={requestedColor}
          gameId={gameId}
          data={data}
          setRequestedColor={setRequestedColor}
        />
      </IsTruthy>
    </>
  );
};

export default StartScreen;
