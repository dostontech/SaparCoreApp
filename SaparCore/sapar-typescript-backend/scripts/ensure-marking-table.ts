import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/prisma';

async function main() {
  console.log('Ensuring MarkingCode table and columns in PostgreSQL...');
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MarkingCode" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL,
      "productId" text,
      "gtin" text NOT NULL,
      "serialNumber" text NOT NULL,
      "expirationDate" text,
      "rawCode" text NOT NULL,
      "status" text DEFAULT 'ACTIVE',
      "soldAt" timestamp,
      "posReceiptId" text,
      "writtenOffAt" timestamp,
      "writeOffReason" text,
      "glAccount" text DEFAULT '9430',
      "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "MarkingCode_userId_rawCode_key" ON "MarkingCode"("userId", "rawCode");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "MarkingCode_userId_status_idx" ON "MarkingCode"("userId", "status");
  `);

  // Ensure columns on Product
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isMarked" boolean DEFAULT false;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "markingCategory" text;
  `);

  // Ensure columns on CompanySettings
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "isIndividualEntrepreneur" boolean DEFAULT false;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "turnoverTaxRate" numeric(5,2) DEFAULT 4;
  `);

  console.log('✅ MarkingCode table and regulatory columns successfully verified in PostgreSQL!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
