CREATE TABLE outfits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    image_url       TEXT,
    occasion        TEXT[],
    seasons         TEXT[],
    styles          TEXT[],
    ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
    ai_reason       TEXT,
    ai_score        NUMERIC(4, 2),
    is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE outfit_items (
    outfit_id           UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    clothing_item_id    UUID NOT NULL REFERENCES clothing_items(id),
    PRIMARY KEY (outfit_id, clothing_item_id)
);

CREATE INDEX idx_outfits_user_id         ON outfits(user_id);
CREATE INDEX idx_outfits_user_favorite   ON outfits(user_id, is_favorite);
CREATE INDEX idx_outfit_items_outfit_id  ON outfit_items(outfit_id);
