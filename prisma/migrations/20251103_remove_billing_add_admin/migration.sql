-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AlterTable
ALTER TABLE "Organization" 
DROP COLUMN "plan",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId", 
DROP COLUMN "subscriptionStatus",
DROP COLUMN "currentPeriodEnd",
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropIndex
DROP INDEX IF EXISTS "Organization_stripeCustomerId_key";

-- CreateIndex
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");

-- DropEnum
DROP TYPE "SubscriptionPlan";



