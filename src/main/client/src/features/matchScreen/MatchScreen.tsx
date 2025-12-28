import React from "react";
import useMatchScreenProps from "./useMatchScreenProps";
import BattleDisplay from "./battleDisplay/BattleDIsplay";

const MatchScreen = () => {
    const { data } = useMatchScreenProps();
    console.log("match screen data", data);
    return <>
        <p>Match Display</p>
        <BattleDisplay />
    </>
};

export default MatchScreen;
