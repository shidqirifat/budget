-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_telegramChatId_key" ON "User"("telegramChatId");
