package com.simback.perfume;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching      // Bật caching
@EnableAsync        // Bật async (gửi email bất đồng bộ)
@EnableRetry        // Bật retry (thử lại khi gửi email thất bại)
public class PerfumeApplication {

	public static void main(String[] args) {
		SpringApplication.run(PerfumeApplication.class, args);
	}

}
