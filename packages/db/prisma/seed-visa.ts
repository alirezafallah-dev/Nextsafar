import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create Visa Countries
  const countries = [
    {
      name: 'Turkey',
      code: 'TR',
      description: 'Tourist visa for Turkey',
      processingTime: '5-7 business days',
      fee: 60,
      currency: 'USD',
    },
    {
      name: 'United Arab Emirates',
      code: 'AE',
      description: 'Tourist visa for UAE',
      processingTime: '3-5 business days',
      fee: 90,
      currency: 'USD',
    },
    {
      name: 'Schengen (Europe)',
      code: 'EU',
      description: 'Schengen visa for European countries',
      processingTime: '15-20 business days',
      fee: 80,
      currency: 'EUR',
    },
  ];

  for (const country of countries) {
    const created = await prisma.visaCountry.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });

    // Create checklists for each country
    const checklists = [
      { name: 'Passport (valid for 6 months)', isRequired: true, order: 1 },
      { name: 'Passport photos (2x2)', isRequired: true, order: 2 },
      { name: 'Flight itinerary', isRequired: true, order: 3 },
      { name: 'Hotel reservation', isRequired: true, order: 4 },
      { name: 'Travel insurance', isRequired: true, order: 5 },
      { name: 'Bank statement (last 3 months)', isRequired: true, order: 6 },
      { name: 'Employment letter', isRequired: false, order: 7 },
    ];

    for (const checklist of checklists) {
      await prisma.visaChecklist.upsert({
        where: {
          id: `${created.id}-${checklist.order}`,
        },
        update: {},
        create: {
          countryId: created.id,
          ...checklist,
        },
      });
    }
  }

  console.log('✅ Visa countries and checklists seeded.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
