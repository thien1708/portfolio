package com.tranvuthien.portfolio.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Application-level cache for the public read endpoints. Content only changes
 * through the admin API and every mutation evicts its cache, so the TTL is a
 * safety net rather than the primary invalidation mechanism.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PROFILE = "profile";
    public static final String SKILLS = "skills";
    public static final String EXPERIENCES = "experiences";
    public static final String PROJECTS = "projects";
    public static final String EDUCATION = "education";
    public static final String CERTIFICATIONS = "certifications";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                PROFILE, SKILLS, EXPERIENCES, PROJECTS, EDUCATION, CERTIFICATIONS);
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(10)
                .expireAfterWrite(Duration.ofMinutes(10)));
        return manager;
    }
}
