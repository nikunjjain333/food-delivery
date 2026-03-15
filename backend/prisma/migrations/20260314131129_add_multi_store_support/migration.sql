/*
  Warnings:

  - Added the required column `storeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the storeId column as nullable
ALTER TABLE "Order" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "Sweet" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultStoreId" TEXT;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "operatingHours" JSONB,
    "deliveryRadius" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "merchantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSweets" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "sweetId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSweets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSweets_storeId_sweetId_key" ON "StoreSweets"("storeId", "sweetId");

-- Create a default store for existing merchants (users with role ADMIN)
INSERT INTO "Store" ("id", "name", "address", "phone", "email", "merchantId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    CONCAT(name, ' Main Store'),
    COALESCE(address, 'Main Location'),
    NULL,
    email,
    id,
    NOW(),
    NOW()
FROM "User"
WHERE "role" = 'ADMIN';

-- Update existing orders to use the default store for their merchant
UPDATE "Order"
SET "storeId" = (
    SELECT s.id
    FROM "Store" s
    WHERE s."merchantId" = (
        SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1
    )
    LIMIT 1
)
WHERE "storeId" IS NULL;

-- Copy existing sweets to all stores with base price and stock
INSERT INTO "StoreSweets" ("id", "storeId", "sweetId", "price", "stock", "isAvailable", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    s.id,
    sw.id,
    sw.price,
    sw.stock,
    sw."isAvailable",
    NOW(),
    NOW()
FROM "Store" s
CROSS JOIN "Sweet" sw;

-- Now make storeId required in Order table
ALTER TABLE "Order" ALTER COLUMN "storeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultStoreId_fkey" FOREIGN KEY ("defaultStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreSweets" ADD CONSTRAINT "StoreSweets_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreSweets" ADD CONSTRAINT "StoreSweets_sweetId_fkey" FOREIGN KEY ("sweetId") REFERENCES "Sweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
