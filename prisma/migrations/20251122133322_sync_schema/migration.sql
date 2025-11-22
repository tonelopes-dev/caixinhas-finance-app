/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `GoalParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `GoalParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VaultMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vaultId,userId]` on the table `VaultMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `SavedReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_vaultId_fkey";

-- DropIndex
DROP INDEX "VaultMember_userId_vaultId_key";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "visibleIn" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "GoalParticipant" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "SavedReport" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paidInstallments" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'trial';

-- AlterTable
ALTER TABLE "VaultMember" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "VaultMember_vaultId_userId_key" ON "VaultMember"("vaultId", "userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
