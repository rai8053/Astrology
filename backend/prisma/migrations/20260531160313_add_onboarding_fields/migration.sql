-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en-US';

-- CreateTable
CREATE TABLE "AstrologyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rashi" TEXT,
    "nakshatra" TEXT,
    "nakshatraLord" TEXT,
    "lagna" TEXT,
    "rashiLord" TEXT,
    "element" TEXT,
    "doshaDominance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AstrologyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AstrologyProfile_userId_key" ON "AstrologyProfile"("userId");

-- CreateIndex
CREATE INDEX "AstrologyProfile_userId_idx" ON "AstrologyProfile"("userId");

-- AddForeignKey
ALTER TABLE "AstrologyProfile" ADD CONSTRAINT "AstrologyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
