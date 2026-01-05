import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@delivery.com' },
    update: {},
    create: {
      email: 'admin@delivery.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Customer',
      phone: '+1234567891',
      role: 'CUSTOMER',
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'driver@delivery.com' },
    update: {},
    create: {
      email: 'driver@delivery.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Driver',
      phone: '+1234567892',
      role: 'DRIVER',
    },
  });

  const receiver = await prisma.user.upsert({
    where: { email: 'receiver@example.com' },
    update: {},
    create: {
      email: 'receiver@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Receiver',
      phone: '+1234567893',
      role: 'CUSTOMER',
    },
  });

  console.log('Created users:', { admin, customer, driver, receiver });

  const parcel = await prisma.parcel.create({
    data: {
      description: 'Sample parcel for testing',
      weight: 2.5,
      dimensions: '30x20x10 cm',
      value: 50,
      priority: 'STANDARD',
      senderId: customer.id,
      receiverId: receiver.id,
      pickupAddress: '123 Main Street, New York, NY 10001',
      deliveryAddress: '456 Oak Avenue, Brooklyn, NY 11201',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.trackingEvent.create({
    data: {
      parcelId: parcel.id,
      status: 'PENDING',
      description: 'Parcel created and awaiting pickup',
      location: '123 Main Street, New York, NY 10001',
    },
  });

  console.log('Created sample parcel:', parcel);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
