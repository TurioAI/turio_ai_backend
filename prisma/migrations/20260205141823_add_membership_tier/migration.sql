-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('turista', 'explorador', 'conquistador');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "membershipEndsAt" TIMESTAMP(3),
ADD COLUMN     "membershipStartedAt" TIMESTAMP(3),
ADD COLUMN     "membershipTier" "MembershipTier" NOT NULL DEFAULT 'turista';
