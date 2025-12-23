-- CreateTable
CREATE TABLE "ProductAlert" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "priceTarget" DOUBLE PRECISION,
    "scoreTarget" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductAlert_productId_idx" ON "ProductAlert"("productId");

-- CreateIndex
CREATE INDEX "ProductAlert_email_idx" ON "ProductAlert"("email");
