-- CreateIndex
CREATE INDEX "idx_accounts_owner_scope" ON "accounts"("ownerId", "scope");

-- CreateIndex
CREATE INDEX "idx_accounts_vault" ON "accounts"("vaultId");

-- CreateIndex
CREATE INDEX "idx_accounts_owner_type" ON "accounts"("ownerId", "type");

-- CreateIndex
CREATE INDEX "idx_categories_owner_name" ON "categories"("ownerId", "name" ASC);

-- CreateIndex
CREATE INDEX "idx_goal_participants_goal" ON "goal_participants"("goalId");

-- CreateIndex
CREATE INDEX "idx_goal_participants_user" ON "goal_participants"("userId");

-- CreateIndex
CREATE INDEX "idx_goals_user_created" ON "goals"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_goals_vault_created" ON "goals"("vaultId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_goals_vault_featured" ON "goals"("vaultId", "isFeatured");

-- CreateIndex
CREATE INDEX "idx_goals_user_visibility" ON "goals"("userId", "visibility");

-- CreateIndex
CREATE INDEX "idx_invitations_receiver_status" ON "invitations"("receiverId", "status");

-- CreateIndex
CREATE INDEX "idx_invitations_email_status" ON "invitations"("receiverEmail", "status");

-- CreateIndex
CREATE INDEX "idx_invitations_sender_date" ON "invitations"("senderId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_invitations_receiver_type_status" ON "invitations"("receiverId", "type", "status");

-- CreateIndex
CREATE INDEX "idx_notifications_user_unread_date" ON "notifications"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_user_date" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_saved_reports_owner_month" ON "saved_reports"("ownerId", "monthYear" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_user_date" ON "transactions"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_vault_date" ON "transactions"("vaultId", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_actor_date" ON "transactions"("actorId", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_user_type_date" ON "transactions"("userId", "type", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_category_date" ON "transactions"("categoryId", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_goal_date" ON "transactions"("goalId", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_recurring" ON "transactions"("recurringId", "isRecurring");

-- CreateIndex
CREATE INDEX "idx_vault_members_user" ON "vault_members"("userId");

-- CreateIndex
CREATE INDEX "idx_vault_members_vault" ON "vault_members"("vaultId");

-- CreateIndex
CREATE INDEX "idx_vault_members_user_vault_role" ON "vault_members"("userId", "vaultId", "role");
