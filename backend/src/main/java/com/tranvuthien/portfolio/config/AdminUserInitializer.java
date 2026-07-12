package com.tranvuthien.portfolio.config;

import com.tranvuthien.portfolio.domain.User;
import com.tranvuthien.portfolio.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the single admin account from ADMIN_EMAIL / ADMIN_PASSWORD at startup.
 * No password hash is ever committed to the repository or the migrations.
 */
@Component
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties props;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                AppProperties props) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = props.admin().email();
        String password = props.admin().password();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }
        if (password == null || password.isBlank()) {
            log.warn("ADMIN_PASSWORD is not set — the admin user was NOT created. "
                    + "Set ADMIN_EMAIL and ADMIN_PASSWORD and restart to enable the admin panel.");
            return;
        }
        User admin = new User();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole("ADMIN");
        userRepository.save(admin);
        log.info("Admin user '{}' created.", email);
        if ("Admin@123".equals(password)) {
            log.warn("The admin account is using the default development password. "
                    + "Change ADMIN_PASSWORD before exposing this application.");
        }
    }
}
