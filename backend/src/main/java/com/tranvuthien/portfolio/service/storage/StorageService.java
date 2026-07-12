package com.tranvuthien.portfolio.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;

public interface StorageService {

    long MAX_SIZE_BYTES = 2L * 1024 * 1024;
    Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp", "gif");

    /**
     * Stores an image and returns the URL it will be publicly served from.
     */
    String store(MultipartFile file);

    static String validateAndGetExtension(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File too large (max 2 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Only image uploads are allowed");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("File must have an extension");
        }
        String extension = originalName.substring(originalName.lastIndexOf('.') + 1)
                .toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Allowed image types: " + ALLOWED_EXTENSIONS);
        }
        return extension;
    }
}
