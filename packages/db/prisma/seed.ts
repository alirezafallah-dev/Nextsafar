import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const roles = ['user', 'support', 'tour_agent', 'visa_agent', 'hotel_agent', 'finance', 'content', 'admin', 'super_admin'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, displayName: roleName.toUpperCase() },
    });
  }
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  if (!superAdminRole) throw new Error('Super admin role not found');
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  await prisma.user.upsert({
    where: { mobile: '09120000000' },
    update: {},
    create: {
      mobile: '09120000000',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      roles: { create: { roleId: superAdminRole.id } },
    },
  });
  console.log('✅ Seeding completed. Super Admin created.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
