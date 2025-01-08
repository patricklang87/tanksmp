import { useStartScreenProps } from "./startScreenProps";
import IsTruthy from "../../components/common/logic/IsTruthy";
import IsFalsy from "../../components/common/logic/IsFalsy";
import JoinMatch from "./JoinMatch";
import CreateNewMatch from "./CreateNewMatch";

const StartScreen = () => {
  const {
    handleInitializeMatchClick,
    handleJoinMatchClick,
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setPlayerName,
    // setRequestedColor,
    setGameId,
    createNewMatch,
    setCreateNewMatch,
  } = useStartScreenProps();

  return (
    <>
      <h1 className="title-card">Tanks fer Nuthin'!</h1>

      <div>
        <button onClick={() => setCreateNewMatch(true)}>Create Match</button>
        <button onClick={() => setCreateNewMatch(false)}>Join Match</button>
      </div>

      <IsTruthy value={createNewMatch}>
        <CreateNewMatch
          setPlayerName={setPlayerName}
          isError={isError}
          isSuccess={isSuccess}
          isLoading={isLoading}
          data={data}
          error={error}
          handleInitializeMatchClick={handleInitializeMatchClick}
        />
      </IsTruthy>

      <IsFalsy value={createNewMatch}>
        <JoinMatch
          setGameId={setGameId}
          setPlayerName={setPlayerName}
          handleJoinMatchClick={handleJoinMatchClick}
        />
      </IsFalsy>
    </>
  );
};

export default StartScreen;
