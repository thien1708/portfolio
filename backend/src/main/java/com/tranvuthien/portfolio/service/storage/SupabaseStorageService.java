package com.tranvuthien.portfolio.service.storage;

import com.tranvuthien.portfolio.config.AppProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.UUID;

/**
 * Uploads images to a Supabase Storage bucket through the Storage REST API.
 * The service_role key never leaves the backend. The bucket must be public
 * (or fronted by a CDN) so the returned URL is directly renderable.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "supabase", matchIfMissing = true)
public class SupabaseStorageService implements StorageService {

    // Content type derived from the whitelisted extension — the client-supplied
    // Content-Type header is not trusted beyond the image/* check in validation.
    private static final Map<String, MediaType> MEDIA_TYPES = Map.of(
            "png", MediaType.IMAGE_PNG,
            "jpg", MediaType.IMAGE_JPEG,
            "jpeg", MediaType.IMAGE_JPEG,
            "webp", MediaType.parseMediaType("image/webp"),
            "gif", MediaType.IMAGE_GIF);

    private final AppProperties.Storage.Supabase supabase;
    private final RestClient restClient;

    public SupabaseStorageService(AppProperties props, RestClient.Builder restClientBuilder) {
        this.supabase = props.storage().supabase();
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(30_000);
        this.restClient = restClientBuilder.requestFactory(requestFactory).build();
    }

    @Override
    public String store(MultipartFile file) {
        if (supabase.url() == null || supabase.url().isBlank()
                || supabase.serviceKey() == null || supabase.serviceKey().isBlank()) {
            throw new IllegalArgumentException(
                    "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
        }
        String extension = StorageService.validateAndGetExtension(file);
        String objectName = UUID.randomUUID() + "." + extension;
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read upload", e);
        }
        restClient.post()
                .uri(supabase.url() + "/storage/v1/object/{bucket}/{name}", supabase.bucket(), objectName)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabase.serviceKey())
                .header("x-upsert", "true")
                .contentType(MEDIA_TYPES.get(extension))
                .body(content)
                .retrieve()
                .toBodilessEntity();
        return supabase.url() + "/storage/v1/object/public/" + supabase.bucket() + "/" + objectName;
    }
}
