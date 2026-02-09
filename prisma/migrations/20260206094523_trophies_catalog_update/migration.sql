/*
  Warnings:

  - You are about to drop the column `badgesCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trophiesCount` on the `User` table. All the data in the column will be lost.
  - Added the required column `imageKey` to the `Trophy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trophy" ADD COLUMN     "imageKey" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "badgesCount",
DROP COLUMN "trophiesCount";

-- CreateIndex
CREATE INDEX "Trophy_active_sortOrder_idx" ON "Trophy"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "UserTrophy_userId_earnedAt_idx" ON "UserTrophy"("userId", "earnedAt");
