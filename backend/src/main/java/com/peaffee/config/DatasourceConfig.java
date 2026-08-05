package com.peaffee.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Prefers DATABASE_URL (postgres://user:pass@host:port/db) when set, otherwise
 * falls back to Spring's DB_JDBC_URL / DB_HOST/DB_PORT/DB_NAME properties.
 */
@Configuration
public class DatasourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(@Value("${DATABASE_URL:}") String databaseUrl, DataSourceProperties props) {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return props.initializeDataSourceBuilder().build();
        }

        // Parse postgres://user:pass@host:port/db directly (its scheme is "postgres"),
        // then rebuild as a jdbc:postgresql:// URL.
        URI uri = URI.create(databaseUrl);
        String userInfo = uri.getUserInfo();
        String user = userInfo == null ? null : userInfo.split(":", 2)[0];
        String pass = (userInfo != null && userInfo.contains(":")) ? userInfo.split(":", 2)[1] : null;
        String host = uri.getHost();
        String url = "jdbc:postgresql://" + host + (uri.getPort() > 0 ? ":" + uri.getPort() : "") + uri.getPath();

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(url)
                .username(user)
                .password(pass)
                .build();
    }
}
