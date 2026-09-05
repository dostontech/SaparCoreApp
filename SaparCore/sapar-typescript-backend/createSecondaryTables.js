const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initSecondaryTables() {
  console.log('Creating secondary tables if not exist...');
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CrmDeal" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "title" TEXT NOT NULL,
      "customerName" TEXT NOT NULL,
      "value" DECIMAL(18, 4) NOT NULL DEFAULT 0,
      "currency" TEXT NOT NULL DEFAULT 'UZS',
      "stage" TEXT NOT NULL DEFAULT 'LEAD',
      "probability" INTEGER NOT NULL DEFAULT 20,
      "assignedToName" TEXT,
      "phone" TEXT,
      "notes" TEXT,
      "expectedCloseDate" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EDocument" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "docType" TEXT NOT NULL,
      "docNumber" TEXT NOT NULL,
      "docDate" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "direction" TEXT NOT NULL DEFAULT 'OUTBOX',
      "sellerName" TEXT NOT NULL,
      "sellerTin" TEXT NOT NULL,
      "sellerAddress" TEXT,
      "sellerDirector" TEXT,
      "buyerName" TEXT NOT NULL,
      "buyerTin" TEXT NOT NULL,
      "buyerAddress" TEXT,
      "buyerDirector" TEXT,
      "totalSum" DECIMAL(18, 4) NOT NULL DEFAULT 0,
      "vatTotal" DECIMAL(18, 4) NOT NULL DEFAULT 0,
      "currency" TEXT NOT NULL DEFAULT 'UZS',
      "canonicalHash" TEXT,
      "publicSignToken" TEXT,
      "signedAt" TIMESTAMP(3),
      "signDetails" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SupportTicket" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "ticketNumber" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "customerName" TEXT NOT NULL,
      "customerEmail" TEXT,
      "customerPhone" TEXT,
      "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
      "status" TEXT NOT NULL DEFAULT 'NEW',
      "slaHours" INTEGER NOT NULL DEFAULT 24,
      "assignedAgentName" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TicketMessage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ticketId" TEXT NOT NULL REFERENCES "SupportTicket"("id") ON DELETE CASCADE,
      "senderName" TEXT NOT NULL,
      "senderRole" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProjectTask" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "projectId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "stage" TEXT NOT NULL DEFAULT 'TODO',
      "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
      "assignedToName" TEXT,
      "estimatedHours" INTEGER NOT NULL DEFAULT 0,
      "actualHours" INTEGER NOT NULL DEFAULT 0,
      "dueDate" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Secondary tables created/verified successfully!');
}

initSecondaryTables()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
