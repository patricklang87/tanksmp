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

    // public String getColorString() {
    //     String rgbaColor = "";
    //     for (int i = 0; i < this.color.length; i++) {
    //         rgbaColor += this.color[i];
    //         if (i != this.color.length - 1) {
    //             rgbaColor += ", ";
    //         }
    //     }
    //     return rgbaColor;
    // }
}
