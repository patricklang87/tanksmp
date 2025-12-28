import { canvasConstants, designConstants } from "../../../../constants";
// import { getCoordinatesOnCircle } from "../../../utils/angleManipulation";
// import { getSelectedActionData } from "../../../utils/tankData";
export const drawTopography = (ctx, customProps) => {
    const { topography, colors } = customProps;
    ctx.clearRect(0, 0, canvasConstants.width, canvasConstants.height);
    ctx.beginPath();
    topography?.forEach((point, index) => {
        const positionX = point.x;
        const positionY = point.y;
        if (index === 0) {
            ctx.moveTo(positionX, positionY);
        }
        else {
            ctx.lineTo(positionX, positionY);
        }
    });
    ctx.lineTo(canvasConstants.width, canvasConstants.height + designConstants.landscapeStrokeWidth);
    ctx.lineTo(0, canvasConstants.height);
    ctx.strokeStyle = colors.landscapeStrokeStyle;
    ctx.lineWidth = designConstants.landscapeStrokeWidth;
    ctx.stroke();
    ctx.fillStyle = colors.landscapeFillStyle;
    ctx.fill();
    ctx.closePath();
};
// export const checkForGroundCollision = ({
//   topography,
//   point,
// }: {
//   topography: Tuple[];
//   point: Tuple | NullTuple;
// }): Tuple | null => {
//   if (point[0] === null) return null;
//   const currentSectorEndIndex = topography.findIndex(
//     (sector) => sector[0] >= point[0]
//   );
//   if (currentSectorEndIndex === -1) return null;
//   const currentSectorStartIndex = currentSectorEndIndex - 1;
//   const startPoint = topography[currentSectorStartIndex];
//   const endPoint = topography[currentSectorEndIndex];
//   const topographyLineY = getYForXInLine({
//     point1: startPoint,
//     point2: endPoint,
//     currentX: point[0],
//   });
//   if (topographyLineY < point[1]) {
//     return [point[0], topographyLineY];
//   }
//   return null;
// };
// export const calculateNewTopographyOnStrike = ({
//   point,
//   topography,
//   tank,
// }: {
//   point: Tuple;
//   topography: Tuple[];
//   tank: Tank;
// }) => {
//   const selectedActionData = getSelectedActionData(tank.selectedAction, tank.availableActions);
//   const damage = selectedActionData.damage || 0
//   const damageRadius = damage / 2;
//   const leftX = point[0] - damageRadius;
//   const rightX = point[0] + damageRadius;
//   const leftCraterRightIndex = topography.findIndex(
//     (segment) => segment[0] >= leftX
//   );
//   const leftCraterLeftIndex = leftCraterRightIndex - 1;
//   const leftCrater = [
//     leftX,
//     getYForXInLine({
//       point1: topography[leftCraterLeftIndex],
//       point2: topography[leftCraterRightIndex],
//       currentX: leftX,
//     }),
//   ];
//   const rightCraterRightIndex = topography.findIndex(
//     (segment) => segment[0] >= rightX
//   );
//   const rightCraterLeftIndex = rightCraterRightIndex - 1;
//   const rightCrater = [
//     rightX,
//     getYForXInLine({
//       point1: topography[rightCraterLeftIndex],
//       point2: topography[rightCraterRightIndex],
//       currentX: rightX,
//     }),
//   ];
//   const leftTopography = topography.slice(0, leftCraterLeftIndex + 1);
//   const rightTopography = topography.slice(
//     rightCraterRightIndex,
//     topography.length
//   );
//   const rightCraterWall = getCoordinatesOnCircle({
//     center: point,
//     radius: damageRadius,
//     angle: 45,
//   });
//   const leftCraterWall = getCoordinatesOnCircle({
//     center: point,
//     radius: damageRadius,
//     angle: -225,
//   });
//   const craterBase = [point[0], point[1] + damageRadius];
//   return [
//     ...leftTopography,
//     leftCrater,
//     leftCraterWall,
//     craterBase,
//     rightCraterWall,
//     rightCrater,
//     ...rightTopography,
//   ];
// };
