export const isTruthy = (value: string | number | boolean): boolean => {
    const truthyValues = [1, "1", "Y", true, "true"];
    return truthyValues.includes(value);
}

export const isFalsy = (value: string | number | boolean) : boolean => {
    const truthyValues = [0, "0", "N", false, "false"];
    return truthyValues.includes(value);
}