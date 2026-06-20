CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    outfit_id       UUID REFERENCES outfits(id) ON DELETE SET NULL,
    image_url       TEXT NOT NULL,
    caption         TEXT,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    likes_count     INTEGER NOT NULL DEFAULT 0,
    comments_count  INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE post_likes (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE follows (
    follower_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    following_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_posts_user_id           ON posts(user_id);
CREATE INDEX idx_posts_visibility_date   ON posts(visibility, created_at DESC);
CREATE INDEX idx_post_likes_post_id      ON post_likes(post_id);
CREATE INDEX idx_comments_post_id        ON comments(post_id, created_at ASC);
CREATE INDEX idx_follows_follower_id     ON follows(follower_id);
CREATE INDEX idx_follows_following_id    ON follows(following_id);
