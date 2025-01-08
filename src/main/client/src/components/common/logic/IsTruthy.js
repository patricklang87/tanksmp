import { isTruthy } from "../../../util/evaluate";
const IsTruthy = ({ value, validationFunction = isTruthy, children, }) => {
    return (validationFunction(value) && children) || null;
};
export default IsTruthy;
