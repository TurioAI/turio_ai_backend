/*
  Warnings:

  - You are about to drop the column `threshold` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedAt` on the `UserBadge` table. All the data in the column will be lost.
  - Added the required column `imageKey` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "threshold",
ADD COLUMN     "imageKey" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserBadge" DROP COLUMN "unlockedAt",
ADD COLUMN     "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Badge_active_sortOrder_idx" ON "Badge"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "UserBadge_userId_earnedAt_idx" ON "UserBadge"("userId", "earnedAt");
