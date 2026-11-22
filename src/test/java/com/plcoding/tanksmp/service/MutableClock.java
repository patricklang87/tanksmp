package com.plcoding.tanksmp.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

/** A clock tests can move forward. */
public class MutableClock extends Clock {

    private volatile Instant currentInstant;

    public MutableClock(Instant startInstant) {
        this.currentInstant = startInstant;
    }

    public void advance(Duration amount) {
        currentInstant = currentInstant.plus(amount);
    }

    @Override
    public ZoneId getZone() {
        return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(ZoneId zone) {
        return this;
    }

    @Override
    public Instant instant() {
        return currentInstant;
    }
}
