import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create Destination
  const dest = await prisma.tourDestination.upsert({
    where: { slug: 'istanbul' },
    update: {},
    create: { name: 'Istanbul', slug: 'istanbul' },
  });

  // Create Tour
  const tour = await prisma.tour.upsert({
    where: { slug: 'istanbul-tour-7-days' },
    update: {},
    create: {
      title: 'Istanbul 7 Days Tour',
      slug: 'istanbul-tour-7-days',
      description: 'A wonderful 7-day trip to Istanbul.',
      status: 'PUBLISHED',
      durationDays: 7,
      durationNights: 6,
      transportType: 'Flight',
      destinationId: dest.id,
    },
  });

  // Create Tour Dates (Future dates)
  const today = new Date();
  await prisma.tourDate.create({
    data: {
      tourId: tour.id,
      startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
      endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),  // +14 days
      totalCapacity: 25,
      remainingCapacity: 10,
      adultPrice: 15000000,
      childPrice: 10000000,
      infantPrice: 2000000,
      singlePrice: 18000000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Sample Tour seeded.');
}
main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
