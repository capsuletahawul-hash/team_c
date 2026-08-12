-- CreateTable
CREATE TABLE "B2BRequest" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "B2BRequest_pkey" PRIMARY KEY ("id")
);
