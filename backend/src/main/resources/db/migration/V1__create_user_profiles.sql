CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE user_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_user_id    VARCHAR(255) UNIQUE NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    username            VARCHAR(100) UNIQUE NOT NULL,
    display_name        VARCHAR(255),
    profile_image_url   TEXT,
    bio                 TEXT,
    gender              VARCHAR(50),
    style_preferences   TEXT[],
    is_private          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_keycloak_user_id ON user_profiles(keycloak_user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
