# Brainstorming Session: Task Manager

**Data:** 2026-02-18
**Duração:** 30 minutos
**Participantes:** @po (Pax), @architect (Aria), @ux-design-expert, @dev (Dex) — facilitado por @analyst (Atlas)
**Goal:** Ideation — mapear features, personas e escopo para um Task Manager moderno como projeto de teste do AIOS

---

## Contexto

Projeto greenfield com objetivo duplo:
1. Construir um Task Manager funcional e moderno
2. Servir como projeto de teste end-to-end do Synkra AIOS

O escopo deve ser suficientemente complexo para exercitar múltiplos agentes e workflows do AIOS, mas controlado o suficiente para ser viável como projeto de demonstração.

---

## Ideas Geradas

**Total:** 22 ideias
**Rodadas:** 3 (inicial, construção, wild cards)

### Por Agente

#### @po (Pax) — Perspectiva de valor de negócio
1. Autenticação com múltiplos perfis de usuário (admin, membro)
2. Tarefas com título, descrição, prazo e prioridade
3. Categorias/labels personalizáveis por usuário
4. Dashboard com resumo de tarefas pendentes, atrasadas e concluídas
5. Notificações por email quando tarefa vence

#### @architect (Aria) — Perspectiva técnica
1. API REST com autenticação JWT
2. Banco de dados relacional com RLS por usuário
3. Frontend SPA com React + TypeScript
4. Cache de listagens para performance
5. Soft delete para tarefas (recovery possível)

#### @ux-design-expert — Perspectiva de experiência
1. Drag & drop para reordenar tarefas
2. Modo dark/light theme
3. Filtros rápidos: hoje, esta semana, atrasadas
4. Edição inline de título sem abrir modal
5. Feedback visual de progresso (% concluído por lista)

#### @dev (Dex) — Perspectiva de implementação
1. Paginação server-side para listas grandes
2. Busca full-text em título e descrição
3. Webhooks para integrar com ferramentas externas
4. API pública documentada com Swagger/OpenAPI
5. Seed de dados para facilitar testes

### Round 2 — Construindo sobre as ideias
- **@po:** Workspaces compartilhados onde times colaboram nas mesmas listas (combinando auth + categorias)
- **@architect:** RLS no Supabase como cenário ideal para @data-engineer praticar (combinando RLS + workspace)
- **@ux-design-expert:** Kanban board como view alternativa à lista linear (combinando drag & drop + prioridade)
- **@dev:** Sistema de tags unificado que funciona como filtro e busca simultaneamente

### Round 3 — Wild Cards
- 🃏 **IA integrada:** botão "Quebrar em subtarefas" que usa Claude para decompor tarefas complexas
- 🃏 **Modo offline-first:** PWA com sync quando voltar online
- 🃏 **Gamificação:** streak de produtividade e pontos por tarefas concluídas no prazo

---

## Categorias Identificadas

| Categoria | Ideias |
|-----------|--------|
| **Core (MVP)** | Auth, CRUD tarefas, prioridade, prazo, categorias, dashboard |
| **Colaboração** | Workspaces, membros, permissões, atribuição de tarefas |
| **UX/Interação** | Drag & drop, filtros rápidos, edição inline, temas |
| **Técnica/Backend** | JWT, RLS, paginação, soft delete, busca full-text |
| **Integrações** | Email, webhooks, Swagger, seed de dados |
| **Wild Cards** | IA, offline-first, gamificação |

---

## Top Recomendações (Priorizadas por ROI para testar o AIOS)

### 1. Auth + Perfis (JWT)
**Value Score:** 10/10 | **Esforço:** 4/10 | **ROI:** 2.5

**Por que importa:** Exercita @architect (decisões de auth), @data-engineer (schema de usuários + RLS), @dev (implementação) e @qa (testes de segurança) — cobre quase todo o ciclo de agentes do AIOS.

**Próximos passos:**
- @pm define requisitos de auth no PRD (perfis, permissões)
- @architect decide stack de auth (Supabase Auth + JWT)
- @data-engineer modela schema de usuários e políticas RLS
- @sm cria story: "Como usuário, quero criar conta e fazer login"

---

### 2. CRUD de Tarefas Completo
**Value Score:** 9/10 | **Esforço:** 3/10 | **ROI:** 3.0

**Por que importa:** É o core do produto. Múltiplas stories independentes permitem testar o SDC (Story Development Cycle) repetidamente com variações de complexidade.

**Próximos passos:**
- @pm define campos obrigatórios e opcionais no PRD
- @sm quebra em stories: criar, editar, excluir (soft delete), listar
- @dev implementa em modo Interactive para documentar decisões
- @qa valida com testes de CRUD e edge cases

---

### 3. RLS por Usuário (Supabase)
**Value Score:** 9/10 | **Esforço:** 5/10 | **ROI:** 1.8

**Por que importa:** Exercita exclusivamente o @data-engineer em seu domínio mais rico — DDL detalhado, políticas RLS, índices, migrations. É o cenário ideal para testar a autoridade do agente de dados.

**Próximos passos:**
- @architect define política de isolamento de dados no PRD
- @data-engineer cria schema: `users`, `tasks`, `categories`, `workspaces`
- @data-engineer implementa RLS: usuário só acessa suas próprias tarefas
- @qa executa `*db-rls-audit` para validar políticas

---

### 4. Dashboard + Filtros
**Value Score:** 8/10 | **Esforço:** 4/10 | **ROI:** 2.0

**Por que importa:** Exercita @ux-design-expert (wireframes, design system) e @dev (queries otimizadas para agregação). Bom para testar o QA Loop com múltiplas iterações de UI.

**Próximos passos:**
- @ux-design-expert cria wireframe do dashboard
- @architect define queries de agregação eficientes
- @dev implementa com filtros: hoje, esta semana, atrasadas, por prioridade
- @qa valida performance e acessibilidade

---

### 5. Categorias/Tags
**Value Score:** 7/10 | **Esforço:** 3/10 | **ROI:** 2.3

**Por que importa:** Feature isolada e independente — perfeita para criar uma story completa do zero e testar o ciclo @sm → @dev → @qa sem dependências externas.

**Próximos passos:**
- @sm cria story autocontida: "Como usuário, quero organizar tarefas com tags"
- @dev implementa CRUD de tags + associação com tarefas
- @qa executa QA Loop para validar edge cases (tag duplicada, tag sem tarefas)

---

## Escopo Recomendado

### Fase 1 — MVP Core *(exercita todo o ciclo SDC)*
- [ ] Auth com JWT + perfis (admin/membro)
- [ ] CRUD de tarefas (título, descrição, prazo, prioridade, status)
- [ ] Categorias/tags personalizáveis
- [ ] Dashboard com filtros básicos
- [ ] RLS por usuário no banco de dados

### Fase 2 — Colaboração *(exercita Spec Pipeline)*
- [ ] Workspaces compartilhados
- [ ] Atribuição de tarefas a membros da equipe
- [ ] Permissões por papel (admin/membro)

### Fase 3 — Diferencial *(wild card opcional)*
- [ ] IA para quebrar tarefas em subtarefas (integração Claude API)

---

## Stack Sugerida

| Camada | Tecnologia | Agente Responsável |
|--------|-----------|-------------------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | @dev + @ux-design-expert |
| Backend/API | Next.js API Routes (App Router) | @architect + @dev |
| Banco de Dados | Supabase (PostgreSQL + RLS + Auth) | @data-engineer |
| Autenticação | Supabase Auth (JWT) | @architect |
| Deploy | Vercel + Supabase Cloud | @devops |
| Testes | Vitest + Playwright | @qa |

---

## Mapeamento de Agentes AIOS por Feature

| Feature | Agentes Exercitados | Workflow Ativado |
|---------|-------------------|-----------------|
| Auth + JWT | @architect, @data-engineer, @dev, @qa | SDC completo |
| CRUD Tarefas | @sm, @dev, @qa | SDC × 4 stories |
| RLS Supabase | @data-engineer, @qa | SDC + db tasks |
| Dashboard | @ux-design-expert, @dev, @qa | SDC + QA Loop |
| Workspaces | @pm, @architect, @dev, @qa | Spec Pipeline + SDC |
| Deploy | @devops | CI/CD workflow |

---

## Key Insights

1. **O projeto cobre 8 dos 9 agentes do AIOS** — apenas @analyst não tem role direto na implementação (papel já cumprido nesta sessão)
2. **A Fase 1 sozinha já é suficiente** para um teste completo do AIOS com 5-8 stories
3. **Supabase é a stack ideal** porque permite exercitar @data-engineer com RLS, migrations e políticas de segurança reais
4. **Workspaces (Fase 2) deve usar o Spec Pipeline** por ser a feature mais complexa — boa para testar a avaliação de complexidade do @architect
5. **A feature de IA (Fase 3) é um diferencial** que testa integração com a própria Claude API — meta-teste do AIOS

---

## Metadados da Sessão

- **Ideas Geradas:** 22
- **Categorias Identificadas:** 6
- **Agentes Participantes:** 4 (@po, @architect, @ux-design-expert, @dev)
- **Facilitador:** @analyst (Atlas)
- **Duração:** 30 minutos
- **Top Recomendações:** 5 com próximos passos definidos

---

*Gerado por @analyst (Atlas) — Synkra AIOS v4.2.13*
*Próximo passo: `@pm *create-doc prd` para criar o PRD formal a partir deste brainstorming*
