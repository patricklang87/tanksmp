package com.plcoding.tanksmp.model;

import lombok.NoArgsConstructor;

import java.util.ArrayList;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.keywords.LandscapeType;

@NoArgsConstructor
public class Topography {
  public ArrayList<Point2D> landscape = new ArrayList<Point2D>();
  private Integer increments = 50;
  private Float maxVariationCoefficient = 0.05f;
  private Float minHeightCoefficient = 0.2f;
  private Float maxHeightCoefficient = 0.8f;

  public ArrayList<Point2D> createInitialTopography(Integer canvasWidth, Integer canvasHeight) {
        ArrayList<Point2D> points = new ArrayList<Point2D>();

        Float maxHeight = canvasHeight * maxHeightCoefficient;
        Integer incrementWidth = canvasWidth / increments;
        LandscapeType landscapeType = generateLandscapeType();
        Float startingHeight = calculateStartingHeight(landscapeType, canvasHeight);
        points.add(new Point2D(0f, startingHeight));

                Integer incrementCount = 1;
                while (incrementCount <= increments) {
                    Point2D previousPoint = points.get(incrementCount - 1);
                  Float previousX = previousPoint.getX();
                  Float previousY = previousPoint.getY();
                  Float currentX = previousX + incrementWidth;
                  Integer negativeOrPositive =
                    Math.random() > getDirection(currentX, canvasWidth, landscapeType) ? 1 : -1;
                  Float variation =
                    negativeOrPositive *
                    canvasHeight *
                    maxVariationCoefficient *
                          (float) Math.random();
                  System.out.println("variation: " + variation.toString());
                  
                  Float currentY = previousY + variation;
                  System.out.println("previousY: " + previousY.toString());
                  System.out.println("currentY: " + currentY.toString());
                  if (currentY > maxHeight) currentY = maxHeight;
                  if (currentY < 0) currentY = 0f;
                  // Point2D nextPoint = new Point2D(currentX, canvasHeight - currentY);
                  Point2D nextPoint = new Point2D(currentX, currentY);
                  
                  points.add(nextPoint);
                  incrementCount++;
                }
              
                landscape = points;
                return points;
    }

  private Float calculateStartingHeight(LandscapeType landscapeType, Integer canvasHeight) {
    Float maxHeight = canvasHeight * maxHeightCoefficient;
    Float startingHeight = getStartingHeight(maxHeight, landscapeType);
    if (startingHeight < minHeightCoefficient * canvasHeight)
      startingHeight = minHeightCoefficient * canvasHeight;
    return startingHeight;
  }

  private LandscapeType generateLandscapeType() {
    LandscapeType[] landscapeTypes = LandscapeType.values();
    Integer numLandscapeTypes = landscapeTypes.length;
    Integer selectedTypeIndex = (int) (Math.random() * numLandscapeTypes);
    return landscapeTypes[selectedTypeIndex];
  }

  private Float getStartingHeight(Float maxHeight, LandscapeType landscapeType) {
    switch (landscapeType) {
      case LandscapeType.RISING:
        return Math.min((float) Math.random(), 0.1f) * maxHeight;
      case LandscapeType.FALLING:
        return Math.max((float) Math.random(), 0.9f) * maxHeight;
      case LandscapeType.VALLEY:
        return Math.max((float) Math.random(), 0.9f) * maxHeight;
      case LandscapeType.PEAK:
        return Math.min((float) Math.random(), 0.1f) * maxHeight;
      case LandscapeType.FLAT:
      default:
        return Math.min((float) Math.random(), 0.3f) * maxHeight;
    }
  }

  private Float getDirection(Float xLocation, Integer canvasWidth, LandscapeType landscapeType) {
    switch (landscapeType) {
      case LandscapeType.RISING:
        return 0.3f;
      case LandscapeType.FALLING:
        return 0.7f;
      case LandscapeType.VALLEY:
        return xLocation > canvasWidth / 2 ? 0.1f : 0.9f;
      case LandscapeType.PEAK:
        return xLocation > canvasWidth / 2 ? 0.9f : 0.f;
      case LandscapeType.FLAT:
      default:
        return 0.5f;
    }
  }

}