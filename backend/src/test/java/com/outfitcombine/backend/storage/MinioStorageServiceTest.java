package com.outfitcombine.backend.storage;

import com.outfitcombine.backend.config.MinioProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MinioStorageServiceTest {

    @Mock private MinioClient minioClient;

    private MinioProperties props;
    private MinioStorageService service;

    @BeforeEach
    void setUp() {
        props = new MinioProperties();
        props.setEndpoint("http://minio:9000");
        props.setAccessKey("minio");
        props.setSecretKey("minio_password");
        props.setBucket("outfit-combine");
        props.setPublicUrl("http://localhost:9000");
        // minioClient mock acts as the presignedMinioClient (built with public URL)
        service = new MinioStorageService(minioClient, props);
    }

    @Test
    void generatePresignedUploadUrl_returnsPublicUrlSignedWithPublicHost() throws Exception {
        String publicPresigned = "http://localhost:9000/outfit-combine/clothing/user-1/abc.jpg?X-Amz-Signature=sig";
        when(minioClient.getPresignedObjectUrl(any())).thenReturn(publicPresigned);

        PresignedUploadResult result = service.generatePresignedUploadUrl("clothing", "user-1", "image/jpeg");

        assertThat(result.presignedUrl()).startsWith("http://localhost:9000");
        assertThat(result.publicUrl()).startsWith("http://localhost:9000/outfit-combine/clothing/user-1/");
        assertThat(result.objectName()).startsWith("clothing/user-1/");
        assertThat(result.objectName()).endsWith(".jpg");
    }

    @Test
    void generatePresignedUploadUrl_usesCorrectExtensionForContentType() throws Exception {
        when(minioClient.getPresignedObjectUrl(any())).thenReturn("http://localhost:9000/bucket/key.png");

        PresignedUploadResult png = service.generatePresignedUploadUrl("profiles", "u1", "image/png");
        assertThat(png.objectName()).endsWith(".png");

        when(minioClient.getPresignedObjectUrl(any())).thenReturn("http://localhost:9000/bucket/key.webp");
        PresignedUploadResult webp = service.generatePresignedUploadUrl("posts", "u1", "image/webp");
        assertThat(webp.objectName()).endsWith(".webp");
    }

    @Test
    void generatePresignedUploadUrl_throwsStorageExceptionOnMinioError() throws Exception {
        when(minioClient.getPresignedObjectUrl(any())).thenThrow(new RuntimeException("MinIO down"));

        assertThatThrownBy(() -> service.generatePresignedUploadUrl("clothing", "u1", "image/jpeg"))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("Failed to generate presigned URL");
    }
}
