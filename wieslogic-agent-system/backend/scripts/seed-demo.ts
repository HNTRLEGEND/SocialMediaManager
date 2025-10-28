import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Minimal demo customer
  await prisma.customer.upsert({
    where: { id: 'ROBOPAC_AETNA_001' },
    create: { id: 'ROBOPAC_AETNA_001', email: 'demo@customer.com' },
    update: {},
  });

  // Optional: a few default sheet mappings
  const mappings: Array<{ logicalName: string; actualSheetName: string }> = [
    { logicalName: 'inquiries', actualSheetName: '01_Inquiries_Log' },
    { logicalName: 'quotations', actualSheetName: '02_Quotation_Options' },
    { logicalName: 'customer_profile', actualSheetName: '03_Customer_Profile' },
    { logicalName: 'master_log', actualSheetName: '13_Master_Log' },
  ];

  for (const m of mappings) {
    await prisma.sheetMapping.upsert({
      where: {
        customerId_logicalName: {
          customerId: 'ROBOPAC_AETNA_001',
          logicalName: m.logicalName,
        },
      },
      update: { actualSheetName: m.actualSheetName },
      create: {
        customerId: 'ROBOPAC_AETNA_001',
        logicalName: m.logicalName,
        actualSheetName: m.actualSheetName,
      },
    });
  }

  console.log('Seed completed: ROBOPAC_AETNA_001 with default sheet mappings');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

