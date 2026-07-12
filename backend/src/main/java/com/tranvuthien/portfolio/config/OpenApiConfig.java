package com.tranvuthien.portfolio.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(
        title = "Portfolio API",
        version = "v1",
        description = "REST API for the personal portfolio of Tran Vu Thien. "
                + "Public endpoints serve portfolio content; /api/v1/admin/** requires a bearer token "
                + "obtained from /api/v1/auth/login.",
        contact = @Contact(name = "Tran Vu Thien", email = "tranvuthien1708@gmail.com")))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {
}
