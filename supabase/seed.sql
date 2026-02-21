-- Seed data for local development
-- Story 1.2: Database Schema & RLS
-- Task Manager — 3 test users × 10 tasks each + categories + associations
--
-- Run with: supabase db reset (resets schema + applies this seed)
-- NOTE: Direct auth.users INSERT works in local Supabase only.
--       In production, use Supabase Admin API to create users.
--
-- UUID prefixes (all valid hex):
--   Users:      00000000-0000-0000-0000-00000000000{1,2,3}
--   Categories: c{1,2,3}000000-0000-0000-0000-00000000000{1,2}
--   Tasks Alice: a100000{1-10}-0000-0000-0000-000000000000
--   Tasks Bob:   b200000{1-10}-0000-0000-0000-000000000000
--   Tasks Carol: d300000{1-10}-0000-0000-0000-000000000000

-- ============================================================
-- Test Users (auth.users — local only)
-- ============================================================
INSERT INTO auth.users (
  id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'alice@test.com',
    crypt('senha123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alice Teste"}',
    false, 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'bob@test.com',
    crypt('senha123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Bob Teste"}',
    false, 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'carol@test.com',
    crypt('senha123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Carol Teste"}',
    false, 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Profiles (trigger creates them, but seed inserts directly
--           in case trigger hasn't run in this environment)
-- ============================================================
INSERT INTO profiles (id, email, full_name)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'alice@test.com', 'Alice Teste'),
  ('00000000-0000-0000-0000-000000000002', 'bob@test.com',   'Bob Teste'),
  ('00000000-0000-0000-0000-000000000003', 'carol@test.com', 'Carol Teste')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Categories (2 per user = 6 total)
-- ============================================================
INSERT INTO categories (id, user_id, name, color)
VALUES
  -- Alice's categories
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Trabalho',  '#3B82F6'),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Pessoal',   '#10B981'),
  -- Bob's categories
  ('c2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Projeto',   '#8B5CF6'),
  ('c2000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Urgente',   '#EF4444'),
  -- Carol's categories
  ('c3000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Estudos',   '#F59E0B'),
  ('c3000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Compras',   '#6366F1')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Tasks — Alice (10 tasks, 1 soft-deleted)
-- prefix: a1 (a=Alice, valid hex)
-- ============================================================
INSERT INTO tasks (id, user_id, title, description, priority, status, position, due_date)
VALUES
  ('a1000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Configurar Supabase',       'Criar projeto e configurar RLS',       'high',   'done',        1, CURRENT_DATE - 2),
  ('a1000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Implementar autenticação',  'Login e signup com JWT',               'high',   'in_progress', 2, CURRENT_DATE + 3),
  ('a1000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Criar layout base',         'Sidebar e navegação responsiva',       'medium', 'todo',        3, CURRENT_DATE + 5),
  ('a1000004-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Revisar documentação',      NULL,                                   'low',    'todo',        4, CURRENT_DATE + 7),
  ('a1000005-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Atualizar dependências',    'npm audit fix + upgrade minors',       'medium', 'todo',        5, CURRENT_DATE - 1),
  ('a1000006-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Escrever testes E2E',       'Playwright para fluxos críticos',      'high',   'todo',        6, CURRENT_DATE + 10),
  ('a1000007-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Configurar Sentry',         'Error tracking em produção',           'medium', 'todo',        7, NULL),
  ('a1000008-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Fazer code review',         'PR #12 aguardando aprovação',          'urgent', 'todo',        8, CURRENT_DATE),
  ('a1000009-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Deploy para staging',       NULL,                                   'medium', 'todo',        9, CURRENT_DATE + 2),
  ('a1000010-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Tarefa na lixeira',         'Exemplo de soft delete',               'low',    'todo',       10, NULL)
ON CONFLICT DO NOTHING;

-- Soft-delete last Alice task
UPDATE tasks
SET deleted_at = NOW() - INTERVAL '1 day'
WHERE id = 'a1000010-0000-0000-0000-000000000000';

-- ============================================================
-- Tasks — Bob (10 tasks)
-- prefix: b2 (b=Bob, valid hex)
-- ============================================================
INSERT INTO tasks (id, user_id, title, description, priority, status, position)
VALUES
  ('b2000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Reunião de sprint',              'Planning Q1',                         'urgent', 'done',        1),
  ('b2000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Refatorar serviço de pagamento', 'Migrar para novo gateway',            'high',   'in_progress', 2),
  ('b2000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Criar mock de API',              'Para testes de integração',           'medium', 'todo',        3),
  ('b2000004-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Revisar backlog',                NULL,                                  'low',    'todo',        4),
  ('b2000005-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Atualizar Swagger',              'Adicionar endpoints novos',           'medium', 'todo',        5),
  ('b2000006-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Configurar alertas',             'PagerDuty para erros críticos',       'high',   'todo',        6),
  ('b2000007-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Pesquisar lib de charts',        'Recharts vs Tremor vs Chart.js',      'low',    'todo',        7),
  ('b2000008-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Criar seed de dados',            'Script para popular banco local',     'medium', 'done',        8),
  ('b2000009-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Documentar API pública',         'OpenAPI spec atualizada',             'medium', 'todo',        9),
  ('b2000010-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'Benchmark de queries',           'Identificar N+1 e slow queries',      'high',   'todo',       10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Tasks — Carol (10 tasks)
-- prefix: d3 (d=Carol/3rd user, valid hex, avoids c=category prefix)
-- ============================================================
INSERT INTO tasks (id, user_id, title, description, priority, status, position)
VALUES
  ('d3000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Estudar TypeScript avançado',   'Generics, conditional types, infer',  'high',   'in_progress', 1),
  ('d3000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Ler livro Clean Code',          'Caps 1-5 esta semana',                'medium', 'todo',        2),
  ('d3000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Fazer curso Next.js',           'App Router + Server Actions',         'high',   'todo',        3),
  ('d3000004-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Praticar SQL avançado',         'Window functions e CTEs',             'medium', 'in_progress', 4),
  ('d3000005-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Contribuir para open source',   'Encontrar good first issue',          'low',    'todo',        5),
  ('d3000006-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Preparar apresentação',         'Tech talk interno sobre RLS',         'urgent', 'todo',        6),
  ('d3000007-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Comprar livros de arquitetura', 'Clean Architecture + DDD',            'low',    'todo',        7),
  ('d3000008-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Revisar notas de aula',         'Módulos 3-5 do bootcamp',             'medium', 'done',        8),
  ('d3000009-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Criar portfolio no GitHub',     'README + projetos destacados',        'high',   'todo',        9),
  ('d3000010-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'Configurar ambiente de dev',    'Dotfiles + tmux + neovim',            'medium', 'done',       10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Task Categories — associations
-- ============================================================

-- Alice: Trabalho tasks
INSERT INTO task_categories (task_id, category_id)
VALUES
  ('a1000001-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001'), -- Configurar Supabase → Trabalho
  ('a1000002-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001'), -- Implementar auth → Trabalho
  ('a1000003-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001'), -- Criar layout → Trabalho
  ('a1000006-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001'), -- Testes E2E → Trabalho
  ('a1000008-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001'), -- Code review → Trabalho
  -- Alice: Pessoal tasks
  ('a1000004-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000002'), -- Revisar docs → Pessoal
  ('a1000005-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000002')  -- Atualizar deps → Pessoal
ON CONFLICT DO NOTHING;

-- Bob: Projeto tasks
INSERT INTO task_categories (task_id, category_id)
VALUES
  ('b2000001-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000001'), -- Sprint → Projeto
  ('b2000002-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000001'), -- Refatorar → Projeto
  ('b2000003-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000001'), -- Mock API → Projeto
  ('b2000009-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000001'), -- Documentar → Projeto
  -- Bob: Urgente tasks
  ('b2000006-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000002'), -- Alertas → Urgente
  ('b2000010-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000002')  -- Benchmark → Urgente
ON CONFLICT DO NOTHING;

-- Carol: Estudos tasks
INSERT INTO task_categories (task_id, category_id)
VALUES
  ('d3000001-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000001'), -- TypeScript → Estudos
  ('d3000002-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000001'), -- Clean Code → Estudos
  ('d3000003-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000001'), -- Next.js → Estudos
  ('d3000004-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000001'), -- SQL → Estudos
  -- Carol: Compras
  ('d3000007-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000002')  -- Comprar livros → Compras
ON CONFLICT DO NOTHING;
