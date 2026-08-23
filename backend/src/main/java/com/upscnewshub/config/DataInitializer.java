package com.upscnewshub.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Startup DataInitializer.
 * No hardcoded demo credentials or automatic password overwrites.
 * Real administrators are created securely via the one-time CLI bootstrap (`npm run create-admin`).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) {
        log.info("UPSC NewsHub AI authentication system ready.");
    }
}
