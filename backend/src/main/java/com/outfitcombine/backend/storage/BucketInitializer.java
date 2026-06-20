package com.outfitcombine.backend.storage;

import com.outfitcombine.backend.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BucketInitializer {

    private static final Logger log = LoggerFactory.getLogger(BucketInitializer.class);

    private final MinioClient minioClient;
    private final MinioProperties props;

    public BucketInitializer(MinioClient minioClient, MinioProperties props) {
        this.minioClient = minioClient;
        this.props = props;
    }

    @PostConstruct
    public void init() {
        try {
            String bucket = props.getBucket();
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("MinIO bucket created: {}", bucket);
            }
            applyPublicReadPolicy(bucket);
        } catch (Exception e) {
            log.error("MinIO bucket initialization failed", e);
        }
    }

    private void applyPublicReadPolicy(String bucket) throws Exception {
        String policy = """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": {"AWS": ["*"]},
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket);

        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(bucket)
                        .config(policy)
                        .build()
        );
        log.info("MinIO public-read policy applied to bucket: {}", bucket);
    }
}
