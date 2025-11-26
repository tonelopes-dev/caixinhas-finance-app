-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "receiverEmail" TEXT,
ALTER COLUMN "receiverId" DROP NOT NULL;
