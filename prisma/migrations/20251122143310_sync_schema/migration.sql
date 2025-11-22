/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoalParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vault` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VaultMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "GoalParticipant" DROP CONSTRAINT "GoalParticipant_goalId_fkey";

-- DropForeignKey
ALTER TABLE "GoalParticipant" DROP CONSTRAINT "GoalParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavedReport" DROP CONSTRAINT "SavedReport_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_destinationAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_goalId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_sourceAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "VaultMember" DROP CONSTRAINT "VaultMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "VaultMember" DROP CONSTRAINT "VaultMember_vaultId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Goal";

-- DropTable
DROP TABLE "GoalParticipant";

-- DropTable
DROP TABLE "Invitation";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "SavedReport";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Vault";

-- DropTable
DROP TABLE "VaultMember";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'trial',
    "trialExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaults" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_members" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "vault_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "creditLimit" DOUBLE PRECISION,
    "logoUrl" TEXT,
    "scope" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "vaultId" TEXT,
    "visibleIn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emoji" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'shared',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "vaultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_participants" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isInstallment" BOOLEAN NOT NULL DEFAULT false,
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "paidInstallments" INTEGER,
    "recurringId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,
    "userId" TEXT,
    "vaultId" TEXT,
    "sourceAccountId" TEXT,
    "destinationAccountId" TEXT,
    "goalId" TEXT,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "monthYear" TEXT NOT NULL,
    "analysisHtml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vault_members_vaultId_userId_key" ON "vault_members"("vaultId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "goal_participants_goalId_userId_key" ON "goal_participants"("goalId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_reports_ownerId_monthYear_key" ON "saved_reports"("ownerId", "monthYear");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_ownerId_key" ON "categories"("name", "ownerId");

-- AddForeignKey
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_members" ADD CONSTRAINT "vault_members_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_members" ADD CONSTRAINT "vault_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_participants" ADD CONSTRAINT "goal_participants_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_participants" ADD CONSTRAINT "goal_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
