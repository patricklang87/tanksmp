package com.plcoding.tanksmp.engine;

import com.plcoding.tanksmp.customTypes.Point2D;

/** A decorative cloud. The point is the left edge of the cloud's vertical center. */
public record Cloud(Point2D point, int size) {
}
