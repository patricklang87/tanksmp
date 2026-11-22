import React from "react";
import useMatchScreenProps from "./useMatchScreenProps";
import BattleDisplay from "./battleDisplay/BattleDIsplay";

const MatchScreen = () => {
    useMatchScreenProps();
    return <>
        <p>Match Display</p>
        <BattleDisplay />
    </>
};

export default MatchScreen;
