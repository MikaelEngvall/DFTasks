package com.dftasks;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DFTasksApplication {
    public static void main(String[] args) {
        SpringApplication.run(DFTasksApplication.class, args);
    }
} 