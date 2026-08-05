package com.peaffee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PeaffeeApplication {

    public static void main(String[] args) {
        SpringApplication.run(PeaffeeApplication.class, args);
    }
}
