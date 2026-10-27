import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Super Admin...');

  // Ensure super_admin role exists
  let superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'super_admin',
        displayName: 'Super Administrator',
        isActive: true,
      },
    });
    console.log('✅ Created super_admin role');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { mobile: '09120000000' },
  });

  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  if (existingUser) {
    // Update existing user
    await prisma.user.update({
      where: { mobile: '09120000000' },
      data: {
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
      },
    });
    console.log('✅ Updated existing user');
  } else {
    // Create new user
    const user = await prisma.user.create({
      data: {
        mobile: '09120000000',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@nextsafar.com',
        passwordHash,
        isActive: true,
        language: 'fa',
        currency: 'IRR',
      },
    });

    // Assign role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    });
    console.log('✅ Created Super Admin user');
  }

  console.log('');
  console.log('🔑 Login Credentials:');
  console.log('   Mobile:   09120000000');
  console.log('   Password: Admin@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
