-- Enable pg_trgm extension for full-text similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for fast trigram search on tasks
CREATE INDEX IF NOT EXISTS tasks_title_trgm_idx ON tasks USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tasks_desc_trgm_idx ON tasks USING gin(description gin_trgm_ops);
