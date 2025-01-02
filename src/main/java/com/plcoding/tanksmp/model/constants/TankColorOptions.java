package com.plcoding.tanksmp.model.constants;

import java.util.ArrayList;
import java.util.Arrays;

public class TankColorOptions {
    RgbaColor a = new RgbaColor(129, 90, 160, 1);
    RgbaColor b = new RgbaColor(223, 242, 102, 1);
    RgbaColor c = new RgbaColor(35, 123, 145, 1);
    RgbaColor d = new RgbaColor(253, 150, 90, 1);
    RgbaColor e = new RgbaColor(0, 148, 84, 1);
    RgbaColor f = new RgbaColor(255, 22, 133, 1);
    ArrayList<RgbaColor> tankColorOptions;

    public TankColorOptions() {
        tankColorOptions = new ArrayList<>(Arrays.asList(a, b, c, d, e, f));
    }

    public ArrayList<RgbaColor> getTankColors() {
        return tankColorOptions;
    }

    public ArrayList<RgbaColor> removeTankColorOption(int ind) {
        tankColorOptions.remove(ind);
        return tankColorOptions;
    } 

}
