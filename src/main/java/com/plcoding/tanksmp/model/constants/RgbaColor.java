package com.plcoding.tanksmp.model.constants;

public class RgbaColor {
    float[] color;

    public RgbaColor(float r, float b, float g, float a) {
        float[] rgbaValues = { r, g, b, a };
        this.color = rgbaValues;
    }

    public float[] getColor() {
        return color;
    }
}
