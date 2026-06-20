CREATE TABLE wear_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    outfit_id       UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    worn_at         TIMESTAMP NOT NULL,
    location        VARCHAR(255),
    occasion        VARCHAR(255),
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    photo_url       TEXT,
    note            TEXT,
    would_wear_again BOOLEAN,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wear_logs_user_id        ON wear_logs(user_id);
CREATE INDEX idx_wear_logs_outfit_id      ON wear_logs(outfit_id);
CREATE INDEX idx_wear_logs_user_worn_at   ON wear_logs(user_id, worn_at DESC);
