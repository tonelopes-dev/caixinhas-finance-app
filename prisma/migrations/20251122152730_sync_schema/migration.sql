/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `notifications` table. All the data in the column will be lost.
  - The `paidInstallments` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "goal_participants" DROP CONSTRAINT "goal_participants_goalId_fkey";

-- DropForeignKey
ALTER TABLE "goal_participants" DROP CONSTRAINT "goal_participants_userId_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_userId_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_senderId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_actorId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_destinationAccountId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_goalId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_sourceAccountId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "vault_members" DROP CONSTRAINT "vault_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "vault_members" DROP CONSTRAINT "vault_members_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "vaults" DROP CONSTRAINT "vaults_ownerId_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "updatedAt",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paidInstallments",
ADD COLUMN     "paidInstallments" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ALTER COLUMN "categoryId" DROP NOT NULL;
