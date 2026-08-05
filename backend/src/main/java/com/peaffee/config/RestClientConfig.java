package com.peaffee.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient paypalRestClient(PaypalProperties props) {
        String base = "live".equals(props.mode())
                ? "https://api-m.paypal.com"
                : "https://api-m.sandbox.paypal.com";
        return RestClient.builder().baseUrl(base).build();
    }
}
