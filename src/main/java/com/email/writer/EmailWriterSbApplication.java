package com.email.writer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EmailWriterSbApplication {

	public static void main(String[] args) {
		System.out.println(
				"GEMINI_API_KEY configured: "
						+ (System.getenv("GEMINI_API_KEY") != null)
		);

		SpringApplication.run(EmailWriterSbApplication.class, args);
	}

}
