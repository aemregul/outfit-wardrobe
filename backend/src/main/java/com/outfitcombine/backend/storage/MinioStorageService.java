package com.outfitcombine.backend.storage;

import com.outfitcombine.backend.config.MinioProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class MinioStorageService implements StorageService {

    private static final int PRESIGNED_TTL_MINUTES = 5;

    private final MinioClient presignedMinioClient;
    private final MinioProperties props;

    public MinioStorageService(
            @Qualifier("presignedMinioClient") MinioClient presignedMinioClient,
            MinioProperties props) {
        this.presignedMinioClient = presignedMinioClient;
        this.props = props;
    }

    @Override
    public PresignedUploadResult generatePresignedUploadUrl(String folder, String userId, String contentType) {
        String ext = extensionFor(contentType);
        String objectName = folder + "/" + userId + "/" + UUID.randomUUID() + "." + ext;

        try {
            // Use the client built with publicUrl so the HMAC signature matches
            // the host that browsers will actually connect to.
            String presignedUrl = presignedMinioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(props.getBucket())
                            .object(objectName)
                            .expiry(PRESIGNED_TTL_MINUTES, TimeUnit.MINUTES)
                            .build()
            );

            String publicUrl = props.getPublicUrl() + "/" + props.getBucket() + "/" + objectName;

            return new PresignedUploadResult(presignedUrl, publicUrl, objectName);
        } catch (Exception e) {
            throw new StorageException("Failed to generate presigned URL", e);
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "bin";
        };
    }
}
