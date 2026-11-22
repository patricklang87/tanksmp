package com.plcoding.tanksmp.config;

import java.time.Clock;
import java.util.Random;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Injectable sources of time and randomness (so tests can fix them), and scheduling for match cleanup. */
@Configuration
@EnableScheduling
public class ApplicationBeansConfiguration {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public Random random() {
        return new Random();
    }
}
