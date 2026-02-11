-- AlterTable
ALTER TABLE "User" ADD COLUMN     "battlesWonCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "citiesVisitedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "distanceTraveledKm" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "monumentsVisitedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nightBattlesCompletedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "FavoriteBattle_battleId_idx" ON "FavoriteBattle"("battleId");

-- CreateIndex
CREATE INDEX "FavoriteChallenge_challengeId_idx" ON "FavoriteChallenge"("challengeId");

-- CreateIndex
CREATE INDEX "User_leagueId_idx" ON "User"("leagueId");

-- CreateIndex
CREATE INDEX "User_battlesWonCount_idx" ON "User"("battlesWonCount");

-- CreateIndex
CREATE INDEX "User_citiesVisitedCount_idx" ON "User"("citiesVisitedCount");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- CreateIndex
CREATE INDEX "UserTrophy_trophyId_idx" ON "UserTrophy"("trophyId");
