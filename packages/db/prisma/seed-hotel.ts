import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.hotel.upsert({
    where: { slug: 'espinas-palace-tehran' },
    update: {},
    create: {
      slug: 'espinas-palace-tehran',
      name: 'Espinas Palace Hotel',
      city: 'Tehran',
      country: 'Iran',
      publishStatus: 'PUBLISHED',
      displayStatus: true,
      shortDescription: 'A luxury 5-star hotel in the heart of Tehran.',
      fullContent: 'Espinas Palace is one of the most luxurious hotels...',
      rating: 4.8,
      images: [{ url: 'https://example.com/image1.jpg', isPrimary: true }],
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym'],
      seoTitle: 'Espinas Palace Hotel Tehran | Nextsafar',
      seoDescription: 'Book Espinas Palace Hotel in Tehran with best prices.',
    },
  });
  console.log('✅ Sample Hotel seeded.');
}
main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
