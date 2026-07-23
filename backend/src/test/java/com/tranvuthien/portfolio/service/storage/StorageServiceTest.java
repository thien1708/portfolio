package com.tranvuthien.portfolio.service.storage;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StorageServiceTest {

    private static final byte[] PNG_HEADER = {
            (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    private static final byte[] JPEG_HEADER = {
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0, 0, 0};

    private MockMultipartFile file(String name, String contentType, byte[] content) {
        return new MockMultipartFile("file", name, contentType, content);
    }

    @Test
    void validPngIsAccepted() {
        assertThat(StorageService.validateAndGetExtension(
                file("photo.png", "image/png", PNG_HEADER))).isEqualTo("png");
    }

    @Test
    void validJpegIsAccepted() {
        assertThat(StorageService.validateAndGetExtension(
                file("photo.jpg", "image/jpeg", JPEG_HEADER))).isEqualTo("jpg");
    }

    @Test
    void htmlRenamedToPngIsRejected() {
        byte[] html = "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8);

        assertThatThrownBy(() -> StorageService.validateAndGetExtension(
                file("photo.png", "image/png", html)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not match");
    }

    @Test
    void jpegContentWithPngExtensionIsRejected() {
        assertThatThrownBy(() -> StorageService.validateAndGetExtension(
                file("photo.png", "image/png", JPEG_HEADER)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not match");
    }

    @Test
    void nonImageContentTypeIsRejected() {
        assertThatThrownBy(() -> StorageService.validateAndGetExtension(
                file("photo.png", "text/html", PNG_HEADER)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("image");
    }

    @Test
    void disallowedExtensionIsRejected() {
        assertThatThrownBy(() -> StorageService.validateAndGetExtension(
                file("photo.svg", "image/svg+xml", PNG_HEADER)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Allowed image types");
    }
}
