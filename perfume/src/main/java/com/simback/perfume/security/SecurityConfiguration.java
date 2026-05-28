package com.simback.perfume.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
        private final AuthenticationEntryPoint authenticationEntryPoint;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final AuthenticationProvider authenticationProvider;

        private static final String[] SWAGGER_WHITELIST = {
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-resources/**",
                        "/configuration/ui",
                        "/configuration/security",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/file/*",
                        "/error/*",
                        "/uploads/**",
                        "/"
        };

        /**
         * Filter chain riêng cho webhook PayOS — ưu tiên cao nhất.
         * Tắt hoàn toàn CORS, CSRF, không cần JWT.
         * PayOS gọi server-to-server nên không cần bất kỳ auth nào.
         */
        @Bean
        @Order(1)
        public SecurityFilterChain webhookFilterChain(HttpSecurity http) throws Exception {
                http
                        .securityMatcher("/api/v1/checkout/payos/webhook")
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(AbstractHttpConfigurer::disable)
                        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
                return http.build();
        }

        @Bean
        @Order(2)
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> {
                                })
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                .requestMatchers("/api/v1/checkout/payos/**").permitAll()
                                                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                                                .anyRequest().authenticated())
                                .exceptionHandling(e -> e.authenticationEntryPoint(authenticationEntryPoint))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .authenticationProvider(authenticationProvider);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                // config.setAllowedOriginPatterns(List.of("http://localhost:*"));
                config.setAllowedOriginPatterns(List.of(
                                "http://localhost:*", // Cho phép tất cả các port chạy ở localhost
                                "http://127.0.0.1:*", // Cho phép chạy bằng IP local (tiện cho Vite)
                                "https://perfume.culus.io.vn", // Cho phép đích danh tên miền Frontend của bạn
                                "https://*.culus.io.vn" // (Tùy chọn) Cho phép tất cả các subdomain khác của culus.io.vn
                                                        // sau này
                ));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setExposedHeaders(List.of("Authorization"));
                config.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
