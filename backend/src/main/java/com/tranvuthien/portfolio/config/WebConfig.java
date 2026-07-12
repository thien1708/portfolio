package com.tranvuthien.portfolio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties props;

    public WebConfig(AppProperties props) {
        this.props = props;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serves files stored by LocalStorageService; harmless when the
        // Supabase provider is active (the directory simply stays empty).
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(Path.of(props.storage().uploadDir())
                        .toAbsolutePath().normalize().toUri().toString());
    }
}
