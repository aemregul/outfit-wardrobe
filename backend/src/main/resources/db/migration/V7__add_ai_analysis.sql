ALTER TABLE clothing_items
    ADD COLUMN IF NOT EXISTS ai_analysis_json JSONB;
