package com.plcoding.tanksmp.engine;

import com.plcoding.tanksmp.customTypes.Point2D;

/** An explosion for the client to animate: it grows to maxRadius and shrinks away again. */
public record Explosion(Point2D center, float maxRadius, int[] color) {
}
