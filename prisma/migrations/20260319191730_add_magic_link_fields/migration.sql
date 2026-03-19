/*
  Warnings:

  - A unique constraint covering the columns `[magicLinkToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "magicLinkExpires" TIMESTAMP(3),
ADD COLUMN     "magicLinkToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_magicLinkToken_key" ON "users"("magicLinkToken");
