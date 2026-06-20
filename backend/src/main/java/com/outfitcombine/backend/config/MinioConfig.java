package com.outfitcombine.backend.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class MinioConfig {

    // Used for internal ops (bucket creation, etc.) — connects via Docker network.
    @Bean
    @Primary
    public MinioClient minioClient(MinioProperties props) {
        return MinioClient.builder()
                .endpoint(props.getEndpoint())
                .credentials(props.getAccessKey(), props.getSecretKey())
                .build();
    }

    // Used for generating presigned URLs — built with the public URL so the
    // HMAC signature matches the host browsers will actually connect to.
    // region("us-east-1") is set explicitly so the SDK never makes a network
    // call to look up the bucket region; all presigned URL computation is local.
    @Bean
    @Qualifier("presignedMinioClient")
    public MinioClient presignedMinioClient(MinioProperties props) {
        return MinioClient.builder()
                .endpoint(props.getPublicUrl())
                .credentials(props.getAccessKey(), props.getSecretKey())
                .region("us-east-1")
                .build();
    }
}
