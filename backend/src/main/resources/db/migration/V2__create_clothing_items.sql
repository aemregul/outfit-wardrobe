CREATE TABLE clothing_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    image_url       TEXT,
    category        VARCHAR(50) NOT NULL,
    sub_category    VARCHAR(100),
    colors          TEXT[],
    brand           VARCHAR(255),
    size            VARCHAR(50),
    seasons         TEXT[],
    styles          TEXT[],
    material        VARCHAR(255),
    pattern         VARCHAR(255),
    product_url     TEXT,
    is_clean        BOOLEAN NOT NULL DEFAULT TRUE,
    wear_count      INTEGER NOT NULL DEFAULT 0,
    last_worn_at    TIMESTAMP,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_user_category ON clothing_items(user_id, category);
CREATE INDEX idx_clothing_items_user_clean ON clothing_items(user_id, is_clean);
