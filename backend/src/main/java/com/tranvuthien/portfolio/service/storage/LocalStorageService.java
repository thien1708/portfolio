package com.tranvuthien.portfolio.service.storage;

import com.tranvuthien.portfolio.config.AppProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/**
 * Saves uploads to a local directory, served back via /uploads/**.
 * Active with STORAGE_PROVIDER=local (default in the "local" profile).
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local")
public class LocalStorageService implements StorageService {

    private final Path uploadDir;

    public LocalStorageService(AppProperties props) {
        this.uploadDir = Path.of(props.storage().uploadDir()).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file) {
        String extension = StorageService.validateAndGetExtension(file);
        String filename = UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(filename));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file", e);
        }
        return "/uploads/" + filename;
    }
}
