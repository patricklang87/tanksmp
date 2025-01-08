import { isTruthy } from "../../../util/evaluate";
const IsFalsy = ({ value, validationFunction = isTruthy, children, }) => {
    return validationFunction(value) ? null : children;
};
export default IsFalsy;
