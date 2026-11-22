import { useEffect, useMemo, useState } from "react";
import { useSubmitTurnMutation } from "../../api/matchSlice";
import { getErrorMessage } from "../../api/errorMessage";
import { sendAimUpdate } from "../../api/stompConnection";
import { throttle } from "../../../util/throttle";
import { useAppSelector } from "../../../redux/hooks";
import { selectPlayerIndex, selectPlayerToken } from "../../../redux/sessionSlice";
import { selectIsReplayInProgress } from "../../../redux/turnAnimationSlice";
import type { Game, Tank, TankAction, TankActionName, TurnCommand } from "../../../types";

export const MIN_SHOT_POWER = 0;
export const MAX_SHOT_POWER = 100;
export const MAX_DRIVE_DISTANCE = 150;

/** Live aim updates go out at most this often; the newest value always follows. */
export const AIM_UPDATE_INTERVAL_MILLISECONDS = 100;

const DEFAULT_ACTION_NAME: TankActionName = "STANDARD_SHOT";

export const getActions = (tank: Tank): TankAction[] => [
  tank.tankActions.standardShot,
  tank.tankActions.steelShotput,
  tank.tankActions.begemot,
  tank.tankActions.drive,
];

/** Weapons without an entry in remainingRounds can be used without limit. */
export const getRoundsLeft = (tank: Tank, actionName: TankActionName): number | null =>
  tank.remainingRounds[actionName] ?? null;

export const hasRoundsLeft = (tank: Tank, actionName: TankActionName): boolean => {
  const roundsLeft = getRoundsLeft(tank, actionName);
  return roundsLeft === null || roundsLeft > 0;
};

export type ControlPanelState = ReturnType<typeof useControlPanel>;

/**
 * Everything the control panel needs: the aim the player is setting up (kept locally and previewed
 * on their own turret), whether they may act right now, and how to submit the turn.
 */
export const useControlPanel = (game: Game) => {
  const playerIndex = useAppSelector(selectPlayerIndex);
  const playerToken = useAppSelector(selectPlayerToken);
  const isReplayInProgress = useAppSelector(selectIsReplayInProgress);
  const [submitTurn, { isLoading: isSubmitting }] = useSubmitTurnMutation();

  const ownTank = playerIndex === null ? undefined : game.players[playerIndex]?.tank;

  const [chosenActionName, setChosenActionName] = useState<TankActionName>(DEFAULT_ACTION_NAME);
  const [turretAngle, setTurretAngle] = useState<number>(ownTank?.turretAngle ?? -90);
  const [shotPower, setShotPower] = useState<number>(ownTank?.shotPower ?? 50);
  const [driveDistance, setDriveDistance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // The turn the server accepted from this player; controls stay locked until the replay has
  // finished and the game has moved on to the next turn.
  const [submittedTurnNumber, setSubmittedTurnNumber] = useState<number | null>(null);

  // A weapon that has just run out of rounds falls back to the standard shot.
  const selectedActionName =
    ownTank && !hasRoundsLeft(ownTank, chosenActionName) ? DEFAULT_ACTION_NAME : chosenActionName;
  const isDriveSelected = selectedActionName === "DRIVE";

  const isOwnTankAlive = !!ownTank && ownTank.shields > 0;
  const hasAlreadySubmittedThisTurn = submittedTurnNumber === game.turnNumber;
  const canAct =
    playerIndex !== null &&
    playerIndex === game.currentPlayerIndex &&
    game.gameStatus === "IN_PROGRESS" &&
    isOwnTankAlive &&
    !isReplayInProgress &&
    !isSubmitting &&
    !hasAlreadySubmittedThisTurn;

  // Let the other players watch the aim being set up. Display only: the turn itself always carries
  // the values from the Fire button. Only sent while this player may act.
  const throttledSendAim = useMemo(
    () => throttle(sendAimUpdate, AIM_UPDATE_INTERVAL_MILLISECONDS),
    []
  );
  useEffect(() => {
    if (!canAct || !playerToken) {
      throttledSendAim.cancel();
      return;
    }
    throttledSendAim(game.gameId, {
      playerToken,
      turretAngle,
      shotPower,
      selectedActionName,
    });
  }, [canAct, playerToken, game.gameId, turretAngle, shotPower, selectedActionName, throttledSendAim]);
  useEffect(() => () => throttledSendAim.cancel(), [throttledSendAim]);

  const buildCommand = (): TurnCommand =>
    isDriveSelected
      ? { actionName: "DRIVE", driveDistance }
      : { actionName: selectedActionName, turretAngle, shotPower };

  const submit = async () => {
    if (!canAct || !playerToken) return;
    setErrorMessage(null);
    try {
      await submitTurn({
        matchId: game.gameId,
        playerToken,
        command: buildCommand(),
      }).unwrap();
      setSubmittedTurnNumber(game.turnNumber);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return {
    ownTank,
    playerIndex,
    selectedActionName,
    isDriveSelected,
    turretAngle,
    shotPower,
    driveDistance,
    canAct,
    isReplayInProgress,
    isSubmitting,
    errorMessage,
    selectAction: setChosenActionName,
    setTurretAngle,
    setShotPower,
    setDriveDistance,
    submit,
  };
};
