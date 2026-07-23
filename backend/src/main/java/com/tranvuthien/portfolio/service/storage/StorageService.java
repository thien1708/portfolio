package com.tranvuthien.portfolio.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
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
        if (!matchesMagicBytes(extension, file)) {
            throw new IllegalArgumentException("File content does not match its extension");
        }
        return extension;
    }

    /**
     * The extension and Content-Type header are both client-controlled; the
     * first bytes of the actual content are not. Files are served publicly, so
     * a renamed HTML/script file must not slip through as an "image".
     */
    private static boolean matchesMagicBytes(String extension, MultipartFile file) {
        byte[] h = new byte[12];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.readNBytes(h, 0, h.length);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read upload", e);
        }
        return switch (extension) {
            case "png" -> read >= 4
                    && h[0] == (byte) 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G';
            case "jpg", "jpeg" -> read >= 3
                    && h[0] == (byte) 0xFF && h[1] == (byte) 0xD8 && h[2] == (byte) 0xFF;
            case "gif" -> read >= 4
                    && h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8';
            case "webp" -> read >= 12
                    && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                    && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P';
            default -> false;
        };
    }
}
