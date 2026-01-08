-- ⚡ OTIMIZAÇÃO DE PERFORMANCE: Índices Críticos para PostgreSQL
-- Baseado na análise de latência: Transações, Vaults, Relatórios

-- =============================================================================
-- 🚀 1. TRANSACTIONS - Tabela mais crítica (alta latência)
-- =============================================================================

-- Índice para buscar transações por usuário + ordenação temporal
-- Consulta: SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_user_date" 
ON "transactions" ("userId", "date" DESC);

-- Índice para transações por vault + data (dashboard de vault)
-- Consulta: SELECT * FROM transactions WHERE vaultId = ? ORDER BY date DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_vault_date" 
ON "transactions" ("vaultId", "date" DESC);

-- Índice para transações por ator + data (perfil do usuário)
-- Consulta: SELECT * FROM transactions WHERE actorId = ? ORDER BY date DESC  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_actor_date"
ON "transactions" ("actorId", "date" DESC);

-- Índice composto para filtros comuns (usuário + tipo + período)
-- Consulta: SELECT * FROM transactions WHERE userId = ? AND type = ? AND date >= ? AND date <= ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_user_type_date"
ON "transactions" ("userId", "type", "date" DESC);

-- Índice para transações recorrentes (agrupamento)
-- Consulta: SELECT * FROM transactions WHERE recurringId = ? AND isRecurring = true
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_recurring"
ON "transactions" ("recurringId", "isRecurring") WHERE "isRecurring" = true;

-- Índice para busca por categoria (relatórios)
-- Consulta: SELECT * FROM transactions WHERE categoryId = ? ORDER BY date DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_category_date"
ON "transactions" ("categoryId", "date" DESC);

-- Índice para transações com goals (acompanhamento de objetivos)
-- Consulta: SELECT * FROM transactions WHERE goalId = ? ORDER BY date DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_goal_date"
ON "transactions" ("goalId", "date" DESC);

-- =============================================================================
-- 🏦 2. VAULT_MEMBERS - Performance de acesso aos vaults
-- =============================================================================

-- Índice para buscar memberships por usuário (página de vaults)
-- Consulta: SELECT * FROM vault_members WHERE userId = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_vault_members_user"
ON "vault_members" ("userId");

-- Índice para buscar membros por vault (dashboard do vault)
-- Consulta: SELECT * FROM vault_members WHERE vaultId = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_vault_members_vault"
ON "vault_members" ("vaultId");

-- Índice composto para verificação de permissões
-- Consulta: SELECT * FROM vault_members WHERE userId = ? AND vaultId = ? AND role = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_vault_members_user_vault_role"
ON "vault_members" ("userId", "vaultId", "role");

-- =============================================================================
-- 💰 3. ACCOUNTS - Performance de contas financeiras
-- =============================================================================

-- Índice para contas pessoais do usuário
-- Consulta: SELECT * FROM accounts WHERE ownerId = ? AND scope = 'personal'
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accounts_owner_scope"
ON "accounts" ("ownerId", "scope");

-- Índice para contas por vault
-- Consulta: SELECT * FROM accounts WHERE vaultId = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accounts_vault"
ON "accounts" ("vaultId");

-- Índice para filtro por tipo de conta (relatórios financeiros)
-- Consulta: SELECT * FROM accounts WHERE ownerId = ? AND type = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accounts_owner_type"
ON "accounts" ("ownerId", "type");

-- =============================================================================
-- 🎯 4. GOALS - Performance de objetivos
-- =============================================================================

-- Índice para goals por usuário + ordenação
-- Consulta: SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_user_created"
ON "goals" ("userId", "createdAt" DESC);

-- Índice para goals por vault + ordenação
-- Consulta: SELECT * FROM goals WHERE vaultId = ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_vault_created"
ON "goals" ("vaultId", "createdAt" DESC);

-- Índice para goals em destaque (dashboard)
-- Consulta: SELECT * FROM goals WHERE vaultId = ? AND isFeatured = true
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_vault_featured"
ON "goals" ("vaultId", "isFeatured") WHERE "isFeatured" = true;

-- Índice para goals por visibilidade
-- Consulta: SELECT * FROM goals WHERE userId = ? AND visibility = 'shared'
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_user_visibility"
ON "goals" ("userId", "visibility");

-- =============================================================================
-- 🔔 5. NOTIFICATIONS - Performance do dashboard
-- =============================================================================

-- Índice crítico para notificações não lidas (muito comum)
-- Consulta: SELECT * FROM notifications WHERE userId = ? AND isRead = false ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_unread_date"
ON "notifications" ("userId", "isRead", "createdAt" DESC) WHERE "isRead" = false;

-- Índice geral para notificações por usuário + ordenação
-- Consulta: SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_date"
ON "notifications" ("userId", "createdAt" DESC);

-- =============================================================================
-- 📧 6. INVITATIONS - Performance de convites
-- =============================================================================

-- Índice para convites recebidos por usuário + status
-- Consulta: SELECT * FROM invitations WHERE receiverId = ? AND status = 'pending'
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_invitations_receiver_status"
ON "invitations" ("receiverId", "status");

-- Índice para convites por email + status (usuários não cadastrados)
-- Consulta: SELECT * FROM invitations WHERE receiverEmail = ? AND status = 'pending'
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_invitations_email_status"
ON "invitations" ("receiverEmail", "status");

-- Índice para convites enviados
-- Consulta: SELECT * FROM invitations WHERE senderId = ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_invitations_sender_date"
ON "invitations" ("senderId", "createdAt" DESC);

-- Índice composto para busca de convites específicos
-- Consulta: SELECT * FROM invitations WHERE receiverId = ? AND type = 'vault' AND status = 'pending'
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_invitations_receiver_type_status"
ON "invitations" ("receiverId", "type", "status");

-- =============================================================================
-- 📊 7. SAVED_REPORTS - Performance de relatórios
-- =============================================================================

-- Índice para relatórios salvos por owner + período
-- Consulta: SELECT * FROM saved_reports WHERE ownerId = ? ORDER BY monthYear DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_saved_reports_owner_month"
ON "saved_reports" ("ownerId", "monthYear" DESC);

-- =============================================================================
-- 📁 8. CATEGORIES - Performance de categorias
-- =============================================================================

-- Índice para categorias por owner + ordenação alfabética
-- Consulta: SELECT * FROM categories WHERE ownerId = ? ORDER BY name ASC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_categories_owner_name"
ON "categories" ("ownerId", "name" ASC);

-- =============================================================================
-- 👥 9. GOAL_PARTICIPANTS - Performance de participações em goals
-- =============================================================================

-- Índice para participantes por goal
-- Consulta: SELECT * FROM goal_participants WHERE goalId = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goal_participants_goal"
ON "goal_participants" ("goalId");

-- Índice para goals onde usuário participa
-- Consulta: SELECT * FROM goal_participants WHERE userId = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goal_participants_user"
ON "goal_participants" ("userId");

-- =============================================================================
-- ✅ VERIFICAÇÃO DOS ÍNDICES
-- =============================================================================

-- Query para verificar tamanho e uso dos índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Query para monitorar queries lentas (após implementação)
SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time,
    rows
FROM pg_stat_statements 
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;