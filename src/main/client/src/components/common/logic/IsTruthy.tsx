import { isTruthy } from "../../../util/evaluate";

const IsTruthy = ({
  value,
  validationFunction = isTruthy,
  children,
}: {
  value: string | number | boolean;
  validationFunction?: (value: string | number | boolean) => boolean;
  children: React.ReactNode;
}) => {
  return (validationFunction(value) && children) || null;
};

export default IsTruthy;
