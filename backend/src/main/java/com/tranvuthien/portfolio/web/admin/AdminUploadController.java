package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.UploadResponse;
import com.tranvuthien.portfolio.service.storage.StorageService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/upload")
@Tag(name = "Admin – Upload")
@SecurityRequirement(name = "bearerAuth")
public class AdminUploadController {

    private final StorageService storageService;

    public AdminUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        return new UploadResponse(storageService.store(file));
    }
}
