-- Migration: initial_schema
-- Story 1.2: Database Schema & RLS
-- Task Manager — Foundation schema with profiles, tasks, categories, task_categories

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- required for crypt() in seed.sql

-- ============================================================
-- ENUM Types
-- ============================================================
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status   AS ENUM ('todo', 'in_progress', 'done');

-- ============================================================
-- Profiles (extends auth.users from Supabase)
-- ============================================================
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger function: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger function: auto-update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  color      TEXT        NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- Tasks
-- ============================================================
CREATE TABLE tasks (
  id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID,                    -- NULL = personal task (Epic 3 adds FK)
  assignee_id  UUID,                    -- NULL = unassigned (Epic 3)
  title        TEXT          NOT NULL CHECK (char_length(title) >= 3),
  description  TEXT,
  due_date     DATE,
  priority     task_priority NOT NULL DEFAULT 'medium',
  status       task_status   NOT NULL DEFAULT 'todo',
  position     INTEGER       NOT NULL DEFAULT 0,
  deleted_at   TIMESTAMPTZ,            -- soft delete: NULL = active
  created_at   TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ   DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX idx_tasks_user_id  ON tasks(user_id);
CREATE INDEX idx_tasks_status   ON tasks(status)              WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date)            WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_position ON tasks(user_id, position)   WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_deleted  ON tasks(user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_tasks_search   ON tasks USING GIN (
  to_tsvector('portuguese', title || ' ' || COALESCE(description, ''))
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- Task Categories (many-to-many junction table)
-- ============================================================
CREATE TABLE task_categories (
  task_id     UUID NOT NULL REFERENCES tasks(id)      ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (task_id, category_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

-- profiles: user can only read/update their own profile
CREATE POLICY "profiles_own" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- categories: user can only access their own categories
CREATE POLICY "categories_own" ON categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tasks: user accesses ALL their tasks (active + soft-deleted)
-- NOTE: filtering by deleted_at IS NULL is done at repository layer (TaskRepository.list())
--       The /api/tasks/trash route explicitly queries deleted_at IS NOT NULL
CREATE POLICY "tasks_own" ON tasks
  FOR ALL
  USING (auth.uid() = user_id AND workspace_id IS NULL)
  WITH CHECK (auth.uid() = user_id AND workspace_id IS NULL);

-- task_categories: accessible if user owns the parent task
CREATE POLICY "task_categories_own" ON task_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
        AND tasks.user_id = auth.uid()
    )
  );
