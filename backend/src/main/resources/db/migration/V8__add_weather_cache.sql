CREATE TABLE weather_cache (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key    VARCHAR(50) NOT NULL UNIQUE,
    temperature  NUMERIC(5, 2) NOT NULL,
    condition    VARCHAR(255) NOT NULL,
    feels_like   NUMERIC(5, 2) NOT NULL,
    humidity     INT NOT NULL,
    cached_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
