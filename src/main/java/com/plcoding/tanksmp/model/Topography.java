// package com.plcoding.tanksmp.model;

// import lombok.AllArgsConstructor;
// import java.util.ArrayList;
// import java.util.List;

// @AllArgsConstructor
// public class Topography {
//     private ArrayList<Float> landscape;
//     private Integer increments = 50;
//     private Float maxVariationCoefficient = 0.05f;
//     private Float minHeightCoefficient = 0.2f;
//     private Float maxHeightCoefficient = 0.8f;

//     public void createInitialTopography(Integer canvasWidth, Integer canvasHeight) {
//         ArrayList<Float[]> points = new ArrayList<Float[]>();

//         Float maxHeight = canvasHeight * maxHeightCoefficient;
//         Integer incrementWidth = canvasWidth / increments;
//         points.add({0, 0});

//     }

//     private Float calculateStartingLineHeight(Integer canvasHeight) {
//         Float maxHeight = canvasHeight * maxHeightCoefficient;
//         Float startingHeight = getStartingHeight(maxHeight);
//         if (startingHeight < minHeightCoefficient * canvasHeight)
//             startingHeight = minHeightCoefficient * canvasHeight;
//         return startingHeight;
//     }

//     private TopographyType generateTopographyType() {

//     }
// }


// // const risingFallingValleyFlatOrPeak = (): {
// //     getStartingHeight: Function;
// //     getDirection: Function;
// //   } => {
// //     const indicator = Math.random();
// //     let returnObject = {
// //       getStartingHeight: (maxHeight: number): number =>
// //         Math.min(Math.random(), 0.3) * maxHeight,
// //       getDirection: () => 0.5,
// //     };
// //     switch (true) {
// //       case 1 >= indicator && indicator > 0.8:
// //         // rising
// //         return {
// //           getStartingHeight: (maxHeight: number): number =>
// //             Math.min(Math.random(), 0.1) * maxHeight,
// //           getDirection: () => 0.3,
// //         };
// //       case 0.8 >= indicator && indicator > 0.6:
// //         //falling
// //         return {
// //           getStartingHeight: (maxHeight: number): number =>
// //             Math.max(Math.random(), 0.9) * maxHeight,
// //           getDirection: () => 0.7,
// //         };
// //       case 0.6 >= indicator && indicator > 0.4:
// //         // valley
// //         return {
// //           getStartingHeight: (maxHeight: number): number =>
// //             Math.max(Math.random(), 0.9) * maxHeight,
// //           getDirection: (xLocation: number, canvasWidth: number): number => {
// //             return xLocation > canvasWidth / 2 ? 0.1 : 0.9;
// //           },
// //         };
// //       case 0.4 >= indicator && indicator > 0.2:
// //         // peak
// //         return {
// //           getStartingHeight: (maxHeight: number): number =>
// //             Math.min(Math.random(), 0.1) * maxHeight,
// //           getDirection: (xLocation: number, canvasWidth: number): number => {
// //             return xLocation > canvasWidth / 2 ? 0.9 : 0.1;
// //           },
// //         };
// //       default:
// //         // flat
// //         return returnObject;
// //     }
// //   };

// // const calculateStartingHeight = ({
// //     canvasHeight,
// //     minHeightCoefficient,
// //     maxHeightCoefficient,
// //     getStartingHeight,
// //   }: {
// //     canvasHeight: number;
// //     minHeightCoefficient: number;
// //     maxHeightCoefficient: number;
// //     getStartingHeight: Function;
// //   }): number => {
// //     const maxHeight: number = canvasHeight * maxHeightCoefficient;
// //     let startingHeight = getStartingHeight(maxHeight);
// //     if (startingHeight < minHeightCoefficient * canvasHeight)
// //       startingHeight = minHeightCoefficient * canvasHeight;
// //     return startingHeight;
// //   };


// // export const createInitialTopography = ({
// //     canvasHeight,
// //     canvasWidth,
// //     increments,
// //     maxVariationCoefficient,
// //     minHeightCoefficient,
// //     maxHeightCoefficient,
// //   }: {
// //     canvasHeight: number;
// //     canvasWidth: number;
// //     increments: number;
// //     maxVariationCoefficient: number;
// //     minHeightCoefficient: number;
// //     maxHeightCoefficient: number;
// //   }): number[][] => {
// //     const points: Tuple[] = [];
  
// //     const { getDirection, getStartingHeight } = risingFallingValleyFlatOrPeak();
  
// //     const maxHeight = canvasHeight * maxHeightCoefficient;
// //     const incrementWidth = canvasWidth / increments;
// //     points.push([
// //       0,
// //       calculateStartingHeight({
// //         canvasHeight,
// //         minHeightCoefficient,
// //         maxHeightCoefficient,
// //         getStartingHeight,
// //       }),
// //     ]);
// //     let incrementCount = 1;
// //     while (incrementCount <= increments) {
// //       const previousX = points[incrementCount - 1][0];
// //       const previousY = points[incrementCount - 1][1];
// //       const currentX = previousX + incrementWidth;
// //       const negativeOrPositive =
// //         Math.random() > getDirection(currentX, canvasWidth) ? 1 : -1;
// //       const variation =
// //         negativeOrPositive *
// //         canvasHeight *
// //         maxVariationCoefficient *
// //         Math.random();
// //       let currentY = previousY + variation;
// //       if (currentY > maxHeight) currentY = maxHeight;
// //       if (currentY < 0) currentY = 0;
// //       points.push([currentX, currentY]);
// //       incrementCount++;
// //     }
  
// //     return points.map((point) => [point[0], canvasHeight - point[1]]);
// //   };