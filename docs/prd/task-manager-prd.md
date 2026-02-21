# Task Manager — Product Requirements Document (PRD)

> **Version:** 1.0 | **Date:** 2026-02-18 | **Author:** @pm (Morgan) | **Status:** Draft

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-18 | 1.0 | Versão inicial — baseada no brainstorming do @analyst | @pm (Morgan) |

---

## Goals

- Entregar um Task Manager web full stack funcional como projeto de demonstração e teste do Synkra AIOS
- Permitir que usuários autenticados criem, organizem e acompanhem tarefas com prioridade, prazo e categorias
- Validar o ciclo completo de agentes do AIOS (planejamento → implementação → QA → deploy) em um projeto real
- Estabelecer uma base de código reutilizável como referência para futuros projetos greenfield com o AIOS
- Entregar MVP funcional em Fase 1 com capacidade de evolução para colaboração em equipe (Fase 2)

## Background Context

O Task Manager é um projeto greenfield escolhido estrategicamente para exercitar o Synkra AIOS de ponta a ponta. O problema central que resolve é duplo: para o usuário final, oferece uma ferramenta simples e eficiente de gestão de tarefas pessoais; para a equipe de desenvolvimento, serve como caso de uso real para validar a orquestração de agentes de IA no ciclo completo de software.

O projeto foi escolhido por ter escopo bem conhecido (reduzindo ambiguidade de domínio), stack moderna relevante (Next.js + Supabase), e features suficientemente diversas para exercitar todos os agentes do AIOS — de @architect (decisões de auth e RLS) a @data-engineer (schema e políticas RLS) a @devops (CI/CD e deploy).

---

## Requirements

### Functional Requirements

- **FR1:** O sistema deve permitir que usuários se cadastrem com email e senha
- **FR2:** O sistema deve permitir login/logout com autenticação JWT via Supabase Auth
- **FR3:** Usuários autenticados devem poder criar tarefas com: título (obrigatório), descrição, prazo, prioridade (baixa/média/alta/urgente) e status (a fazer/em progresso/concluído)
- **FR4:** Usuários devem poder editar qualquer campo de suas próprias tarefas
- **FR5:** Usuários devem poder excluir tarefas (soft delete — tarefa fica recuperável por 30 dias)
- **FR6:** Usuários devem poder criar, editar e excluir categorias/tags e associá-las a tarefas
- **FR7:** O sistema deve exibir um dashboard com contagem de tarefas por status (pendentes, em progresso, concluídas, atrasadas)
- **FR8:** Usuários devem poder filtrar tarefas por: status, prioridade, categoria, prazo (hoje / esta semana / atrasadas)
- **FR9:** Cada usuário deve ver apenas suas próprias tarefas (isolamento por RLS no banco)
- **FR10:** O sistema deve suportar busca por texto em título e descrição das tarefas

### Non-Functional Requirements

- **NFR1:** A aplicação deve ser responsiva (mobile-first, Web Responsive)
- **NFR2:** Tempo de resposta das listagens deve ser < 500ms para até 1000 tarefas por usuário
- **NFR3:** A autenticação deve usar JWT com expiração configurável (padrão: 7 dias)
- **NFR4:** O banco de dados deve implementar RLS (Row Level Security) garantindo isolamento completo entre usuários
- **NFR5:** O deploy deve ser realizado com CI/CD automatizado (GitHub Actions + Vercel)
- **NFR6:** A cobertura de testes deve ser ≥ 80% para lógica de negócio crítica (auth, CRUD, RLS)
- **NFR7:** A aplicação deve seguir WCAG AA para acessibilidade
- **NFR8:** Dados de usuários devem ser armazenados conforme boas práticas de segurança (senhas nunca em plaintext, tokens não expostos no cliente)

---

## User Interface Design Goals

### Overall UX Vision
Uma interface limpa, focada em produtividade e sem fricção. O usuário deve conseguir criar uma tarefa em menos de 10 segundos a partir de qualquer tela. O design prioriza clareza hierárquica (o que é urgente/atrasado se destaca visivelmente) sobre riqueza visual.

### Key Interaction Paradigms
- **Lista como padrão** — view principal é uma lista filtrada de tarefas, densa mas legível
- **Edição inline** — título editável diretamente na lista, sem abrir modal
- **Ações contextuais** — hover/swipe revela ações rápidas (completar, editar, excluir)
- **Filtros persistentes** — filtros ativos sobrevivem à navegação entre seções
- **Drag & drop** — reordenação por arrastar (confirmado no MVP)

### Core Screens and Views
1. Login / Cadastro — auth simples, sem onboarding complexo
2. Dashboard — resumo com cards de contagem (pendentes, em progresso, atrasadas, concluídas)
3. Lista de Tarefas — view principal com filtros, busca e ordenação
4. Detalhe da Tarefa — edição completa de todos os campos
5. Gerenciar Categorias — CRUD de tags/categorias
6. Configurações de Conta — perfil, senha, preferências

### Accessibility
WCAG AA — padrão adequado para o projeto.

### Branding
Design system neutro com Tailwind CSS. Paleta funcional: azul para ações primárias, vermelho para urgente/atrasado, verde para concluído. Sem identidade visual corporativa definida.

### Target Device and Platforms
Web Responsive — Next.js. Mobile funciona adequadamente, não é prioridade do MVP.

---

## Technical Assumptions

### Repository Structure: Monorepo
Projeto único no repositório. Frontend, backend (API Routes) e infraestrutura na mesma raiz Next.js.

### Service Architecture
**Monolith via Next.js App Router** — API Routes do Next.js como backend. Supabase como serviço externo gerenciado.

```
Stack completa:
├── Frontend:    Next.js 16+ (App Router) + React 18+ + TypeScript
├── Estilização: Tailwind CSS + shadcn/ui
├── Estado:      Zustand (global) + React Query (server state)
├── Backend:     Next.js API Routes
├── Validação:   Zod (schemas compartilhados front/back)
├── Banco:       Supabase (PostgreSQL + RLS + Auth)
├── Deploy:      Vercel (frontend) + Supabase Cloud (banco)
└── CI/CD:       GitHub Actions
```

### Testing Requirements
- **Unit:** Vitest — lógica de negócio, services, utils
- **Integration:** Vitest + Supabase local — API Routes com banco real
- **E2E:** Playwright — fluxos críticos (auth, CRUD de tarefas)
- **Manual:** Seed de dados para testes exploratórios pelo @qa

### Additional Technical Assumptions
- Drag & drop implementado com `@dnd-kit/core`
- Busca full-text via `pg_trgm` no PostgreSQL (Supabase)
- Soft delete com coluna `deleted_at` + RLS filtrando registros não-nulos
- Migrations gerenciadas via Supabase CLI
- Variáveis de ambiente seguem padrão `.env.local` (nunca commitadas)
- Preset ativo: `nextjs-react` (Next.js 16+, React, TypeScript, Tailwind, Zustand)

---

## Epic List

| # | Epic | Objetivo |
|---|------|----------|
| 1 | Foundation & Authentication | Infraestrutura, CI/CD, banco, RLS e auth — sistema deployado e funcional |
| 2 | Core Task Management & UX | CRUD de tarefas, categorias, dashboard, filtros, busca e drag & drop |
| 3 | Team Collaboration | Workspaces compartilhados, membros, atribuição e dashboard de equipe |
| 4 | AI Enhancement *(opcional)* | Integração Claude API para decomposição automática de tarefas em subtarefas |

---

## Epic 1: Foundation & Authentication

**Objetivo:** Estabelecer toda a infraestrutura técnica do projeto — repositório, pipeline de CI/CD, banco de dados com schema inicial e RLS, e autenticação completa. Ao final deste epic o sistema está deployado em produção, um usuário real pode criar conta e fazer login, e toda a camada de segurança de isolamento de dados está no lugar.

### Story 1.1: Project Setup & CI/CD Pipeline
*Como desenvolvedor, quero o projeto Next.js inicializado com TypeScript, Tailwind e pipeline de CI/CD configurado, para que a equipe tenha uma base estável para construir.*

**Acceptance Criteria:**
1. Next.js 16+ com App Router e TypeScript inicializado e rodando localmente
2. Tailwind CSS + shadcn/ui configurados com tema padrão funcional
3. ESLint + Prettier configurados com regras do preset `nextjs-react`
4. Repositório GitHub criado com branches `main` e `develop`
5. GitHub Actions executa lint + typecheck + testes a cada push/PR
6. Deploy automático na Vercel configurado (preview em PRs, produção no merge para `main`)
7. Rota `/api/health` retorna `{ status: "ok", timestamp }` com HTTP 200
8. Página inicial exibe "Task Manager — Coming Soon" confirmando deploy funcionando

### Story 1.2: Database Schema & RLS
*Como desenvolvedor, quero o Supabase configurado com schema inicial e políticas RLS, para que a aplicação tenha uma camada de dados segura e corretamente estruturada.*

**Acceptance Criteria:**
1. Projeto Supabase criado e variáveis de ambiente configuradas (`.env.local`, `.env.example`)
2. Supabase CLI configurado com ambiente local de desenvolvimento funcionando
3. Migration inicial cria as tabelas: `profiles`, `tasks`, `categories`, `task_categories`
4. Tabela `tasks` contém: `id`, `user_id`, `title`, `description`, `due_date`, `priority` (enum), `status` (enum), `position`, `deleted_at`, `created_at`, `updated_at`
5. RLS habilitado em todas as tabelas — usuário acessa apenas seus próprios registros
6. Política de soft delete: queries padrão filtram `deleted_at IS NULL` automaticamente via RLS
7. Trigger cria registro em `profiles` automaticamente ao signup no Supabase Auth
8. Script de seed popula banco local com dados de teste (3 usuários, 10 tarefas cada)
9. `@data-engineer` valida políticas RLS via `*db-rls-audit`

### Story 1.3: User Authentication
*Como visitante, quero criar uma conta e fazer login, para que eu possa acessar meu gerenciador de tarefas pessoal.*

**Acceptance Criteria:**
1. Página de cadastro com campos: email, senha, confirmação de senha — validação via Zod
2. Página de login com campos: email e senha
3. Mensagens de erro claras: email já cadastrado, credenciais inválidas, senha fraca
4. Login bem-sucedido redireciona para `/dashboard`
5. Sessão JWT gerenciada pelo Supabase Auth com expiração de 7 dias
6. Logout encerra sessão e redireciona para `/login`
7. Rotas autenticadas redirecionam para `/login` se sem sessão válida
8. Rotas de auth (`/login`, `/signup`) redirecionam para `/dashboard` se já autenticado

### Story 1.4: Base Layout & Navigation
*Como usuário autenticado, quero um layout consistente com navegação, para que eu possa me mover entre as seções da aplicação eficientemente.*

**Acceptance Criteria:**
1. Layout autenticado com sidebar (desktop) e bottom navigation (mobile)
2. Links de navegação: Dashboard, Tarefas, Categorias, Configurações
3. Header exibe nome e avatar do usuário logado
4. Botão de logout acessível no header/sidebar
5. Layout responsivo funciona corretamente em mobile (375px) e desktop (1280px)
6. Loading skeleton exibido durante carregamento de dados
7. Error boundary captura erros não tratados e exibe mensagem amigável
8. Página 404 customizada para rotas não encontradas

---

## Epic 2: Core Task Management & UX

**Objetivo:** Implementar o produto principal de ponta a ponta — criação e gestão completa de tarefas, organização por categorias, dashboard de produtividade, filtros avançados, busca e reordenação por drag & drop. Ao final deste epic o Task Manager é um produto funcional e utilizável diariamente.

### Story 2.1: Task List & Create
*Como usuário autenticado, quero ver minha lista de tarefas e criar novas tarefas rapidamente, para que eu possa começar a organizar meu trabalho imediatamente.*

**Acceptance Criteria:**
1. Página `/tasks` exibe lista paginada das tarefas do usuário (20 por página)
2. Cada item da lista exibe: título, prioridade (badge colorido), prazo, status e categoria(s)
3. Estado vazio exibe ilustração e botão "Criar primeira tarefa"
4. Botão "Nova Tarefa" abre formulário lateral (drawer) com campos: título (obrigatório), descrição, prazo, prioridade (select), categoria(s) (multi-select)
5. Validação Zod no frontend e na API Route — título mínimo 3 caracteres
6. Tarefa criada aparece no topo da lista sem reload de página (React Query invalidation)
7. Tarefas atrasadas (prazo passado + status não concluído) exibem indicador visual vermelho
8. Loading skeleton durante carregamento inicial da lista

### Story 2.2: Task Edit, Delete & Recovery
*Como usuário, quero editar, excluir e recuperar tarefas, para que eu mantenha minha lista sempre precisa e não perca dados por engano.*

**Acceptance Criteria:**
1. Clique no título da tarefa na lista abre edição inline do título (sem modal)
2. Clique em qualquer outro campo abre drawer de edição completa com todos os campos
3. Alterações salvas otimisticamente no cliente (UI atualiza imediatamente, reverte em erro)
4. Botão de excluir (soft delete) pede confirmação com mensagem "Tarefa movida para a lixeira"
5. Toast de confirmação após exclusão exibe botão "Desfazer" por 5 segundos
6. Tarefas excluídas são filtradas da lista principal automaticamente via RLS
7. Página `/tasks/trash` lista tarefas excluídas nos últimos 30 dias com opção de recuperar
8. Status da tarefa alterável via dropdown direto na lista (sem abrir drawer)

### Story 2.3: Category Management & Association
*Como usuário, quero criar categorias personalizadas e associá-las às minhas tarefas, para que eu possa organizar tarefas por contexto ou projeto.*

**Acceptance Criteria:**
1. Página `/categories` lista todas as categorias do usuário com contagem de tarefas associadas
2. CRUD completo de categorias: criar com nome + cor (palette de 12 cores), editar, excluir
3. Exclusão de categoria com tarefas associadas exibe aviso e opção de reassociar ou manter sem categoria
4. Multi-select de categorias no formulário de criação/edição de tarefas (máximo 5 por tarefa)
5. Badges de categoria exibidos em cada tarefa na lista com a cor configurada
6. Filtro rápido na lista de tarefas por categoria (click no badge filtra a lista)

### Story 2.4: Dashboard Overview
*Como usuário, quero um dashboard com visão geral das minhas tarefas, para que eu possa avaliar minha produtividade e prioridades rapidamente.*

**Acceptance Criteria:**
1. Página `/dashboard` exibe 4 cards de métricas: Total, A fazer, Em progresso, Concluídas
2. Card adicional "Atrasadas" com destaque em vermelho (prazo passado + não concluídas)
3. Lista "Vencendo hoje" exibe tarefas com prazo no dia atual
4. Lista "Próximas" exibe as 5 tarefas com prazo mais próximo
5. Gráfico de barras simples mostrando tarefas concluídas nos últimos 7 dias
6. Dados do dashboard atualizados em tempo real via React Query (refetch a cada 60s)
7. Estado vazio do dashboard encoraja criação da primeira tarefa com CTA

### Story 2.5: Filters & Full-Text Search
*Como usuário, quero filtrar e buscar minhas tarefas, para que eu encontre rapidamente o que preciso mesmo com muitas tarefas cadastradas.*

**Acceptance Criteria:**
1. Barra de filtros na página `/tasks` com: Status (multi-select), Prioridade (multi-select), Categoria (multi-select), Prazo (hoje / esta semana / atrasadas / sem prazo)
2. Filtros ativos exibidos como chips removíveis abaixo da barra de busca
3. Botão "Limpar filtros" visível quando há filtros ativos
4. Campo de busca executa full-text search em título e descrição via `pg_trgm` no Supabase
5. Busca com debounce de 300ms (não dispara query a cada tecla)
6. URL atualizada com parâmetros de filtro/busca (compartilhável e preservado no reload)
7. Filtros e busca combinados funcionam corretamente juntos
8. Contagem de resultados exibida ("Exibindo 12 de 47 tarefas")

### Story 2.6: Drag & Drop Reordering
*Como usuário, quero reordenar minhas tarefas arrastando-as, para que eu possa organizar visualmente minha lista de prioridades.*

**Acceptance Criteria:**
1. Tarefas na lista `/tasks` são reordenáveis via drag & drop usando `@dnd-kit/core`
2. Handle de drag exibido ao hover em cada item (ícone de 6 pontos)
3. Feedback visual durante drag: item arrastado com sombra, posição destino com placeholder
4. Ordem persistida no banco via coluna `position` (PATCH API Route)
5. Reordenação funciona em touch/mobile (drag touch events)
6. Ordem preservada ao aplicar filtros (filtros não resetam a ordem manual)
7. Performance: lista de até 100 itens sem lag perceptível durante drag

---

## Epic 3: Team Collaboration

**Objetivo:** Evoluir o Task Manager de uma ferramenta individual para uma plataforma de colaboração em equipe através de workspaces compartilhados. Membros do mesmo workspace visualizam e gerenciam tarefas coletivas, com permissões por papel. Requer Spec Pipeline antes da implementação.

### Story 3.1: Workspace Data Model & RLS Update
*Como desenvolvedor, quero o schema de workspaces criado e as políticas RLS atualizadas, para que a camada de dados suporte colaboração multi-usuário de forma segura.*

**Acceptance Criteria:**
1. Migration cria tabelas: `workspaces`, `workspace_members`, `workspace_invitations`
2. Coluna `workspace_id` (nullable) adicionada à tabela `tasks`
3. RLS atualizado: tarefas de workspace visíveis a todos os membros do workspace
4. RLS preserva isolamento de tarefas pessoais (workspace_id IS NULL → apenas dono)
5. Roles definidos como enum: `admin`, `member`
6. `@data-engineer` executa `*db-rls-audit` validando isolamento workspace vs. pessoal
7. Seed de dados atualizado com 2 workspaces de teste e membros variados

### Story 3.2: Workspace Creation & Member Management
*Como usuário, quero criar um workspace e convidar membros por email, para que minha equipe possa colaborar no mesmo espaço de tarefas.*

**Acceptance Criteria:**
1. Modal "Novo Workspace" com campos: nome (obrigatório) e descrição opcional
2. Página `/workspaces` lista workspaces do usuário (como owner e como membro)
3. Admin pode convidar membros por email — email de convite enviado via Supabase
4. Link de convite expira em 72 horas
5. Usuário convidado vê notificação de convite pendente ao fazer login
6. Aceitar convite adiciona usuário ao workspace com role `member`
7. Admin pode remover membros e alterar roles (member ↔ admin)
8. Membro pode sair do workspace (exceto último admin)
9. Exclusão de workspace move tarefas do workspace para tarefas pessoais dos donos

### Story 3.3: Shared Task Context
*Como membro de um workspace, quero criar e visualizar tarefas do workspace, para que a equipe trabalhe com visibilidade compartilhada das atividades.*

**Acceptance Criteria:**
1. Seletor de contexto no header: "Pessoal" ou nome do workspace ativo
2. Todas as páginas (Tasks, Dashboard, Categories) refletem o contexto selecionado
3. Contexto persiste na sessão (não reseta ao navegar)
4. Tarefas criadas no contexto de workspace são automaticamente associadas ao `workspace_id`
5. Membros do workspace visualizam todas as tarefas do workspace
6. Badge visual distingue tarefas pessoais de tarefas de workspace na lixeira
7. Filtro "Criado por mim" disponível no contexto de workspace

### Story 3.4: Task Assignment
*Como membro de um workspace, quero atribuir tarefas a colegas de equipe, para que fique claro quem é responsável por cada atividade.*

**Acceptance Criteria:**
1. Campo "Responsável" adicionado ao formulário de criação/edição de tarefas de workspace
2. Select exibe membros do workspace com avatar e nome
3. Avatar do responsável visível em cada tarefa na lista
4. Filtro "Responsável" adicionado à barra de filtros no contexto workspace
5. View "Minhas atribuições" exibe todas as tarefas atribuídas ao usuário logado
6. Tarefa sem responsável exibe "Não atribuída" com ícone neutro
7. Somente admins e o criador da tarefa podem alterar o responsável

### Story 3.5: Workspace Dashboard
*Como admin de um workspace, quero um dashboard da equipe com métricas de progresso por membro, para que eu possa acompanhar a produtividade coletiva.*

**Acceptance Criteria:**
1. Dashboard no contexto workspace exibe métricas agregadas do time
2. Seção "Por membro" lista cada membro com contagem de tarefas abertas e concluídas
3. Lista "Atrasadas do time" exibe tarefas atrasadas com responsável indicado
4. Gráfico de atividade mostra tarefas concluídas por dia nos últimos 7 dias (agregado)
5. Admin pode clicar em membro para filtrar a lista de tarefas por aquele responsável
6. Dashboard pessoal não é afetado — mantém comportamento do Epic 2

---

## Epic 4: AI Enhancement *(opcional — Fase 3)*

**Objetivo:** Integrar a Claude API para decomposição automática de tarefas complexas em subtarefas acionáveis. Introduz o modelo de subtarefas que pode ser usado manualmente ou via IA. Iniciar apenas após Epic 2 estável em produção.

### Story 4.1: Subtask Data Model & Manual Management
*Como usuário, quero criar subtarefas vinculadas a uma tarefa principal, para que eu possa decompor tarefas complexas em passos menores rastreáveis.*

**Acceptance Criteria:**
1. Migration adiciona tabela `subtasks` (id, task_id, title, status, position, created_at)
2. RLS em `subtasks` herda isolamento da tarefa pai
3. Seção "Subtarefas" no drawer de detalhe com lista e campo de criação inline
4. Subtarefas com checkbox de conclusão — atualização imediata
5. Barra de progresso na tarefa pai mostra `X de Y subtarefas concluídas`
6. Subtarefas reordenáveis via drag & drop dentro do drawer
7. Contador de subtarefas exibido no card da tarefa na lista principal

### Story 4.2: Claude API Integration & Rate Limiting
*Como desenvolvedor, quero a integração com a Claude API configurada com rate limiting, para que as features de IA sejam seguras e com custo controlado.*

**Acceptance Criteria:**
1. `ANTHROPIC_API_KEY` configurada via variável de ambiente (nunca exposta no cliente)
2. API Route `/api/ai/decompose` recebe `task_id` e retorna subtarefas sugeridas
3. Rate limiting: máximo 10 chamadas de IA por usuário por hora
4. Timeout de 30 segundos com mensagem de erro amigável
5. Erros da API retornam mensagens claras sem expor detalhes internos
6. Log de uso de IA por usuário para monitoramento de custos (`ai_usage_logs`)
7. Feature flag `ENABLE_AI_FEATURES=true/false`

### Story 4.3: AI Task Decomposition
*Como usuário, quero clicar em "Quebrar com IA" e receber subtarefas sugeridas automaticamente, para que eu não precise decompor manualmente tarefas complexas.*

**Acceptance Criteria:**
1. Botão "✨ Quebrar com IA" no drawer de detalhe (visível apenas se `ENABLE_AI_FEATURES=true`)
2. Loading state durante processamento ("Analisando tarefa...")
3. Claude retorna 3-7 subtarefas sugeridas em português
4. Modal de revisão permite desmarcar subtarefas indesejadas antes de confirmar
5. Subtarefas confirmadas criadas na tarefa pai
6. Aviso se tarefa já tem subtarefas existentes
7. Prompt inclui: título, descrição e categorias da tarefa
8. Botão desabilitado com tooltip quando rate limit é atingido

---

## Next Steps

### UX Expert Prompt
> @ux-design-expert — Este PRD está pronto. Por favor, use-o como input para criar o documento de arquitetura de frontend e wireframes das telas principais (Dashboard, Lista de Tarefas, Detalhe da Tarefa). Foque nas Core Screens definidas na seção UI Goals e nos paradigmas de interação (edição inline, drag & drop, filtros persistentes).

### Architect Prompt
> @architect — Este PRD está pronto para criação da arquitetura técnica. Por favor, use-o como input para criar o documento de arquitetura do sistema. Stack definida: Next.js 16+ App Router, TypeScript, Tailwind, Supabase (PostgreSQL + Auth + RLS), Vercel, GitHub Actions. Preset ativo: `nextjs-react`. Foque em: estrutura de pastas, Contract Patterns, API Routes design, schema de banco de dados e estratégia de RLS.
