import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db';

async function main() {
  console.log('Seeding Database...');

  // Create Merchant (Admin)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rohitsweets.com' },
    update: {},
    create: {
      email: 'admin@rohitsweets.com',
      name: 'Rohit Sweets Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create Customer
  const hashedCustomerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'Test Customer',
      password: hashedCustomerPassword,
      role: 'CUSTOMER',
    },
  });
  console.log('Customer user created:', customer.email);

  // Seed Sweets
  const sweets = [
    { name: 'Kaju Katli', price: 800, description: 'Premium cashew fudge with silver leaf.', imageUrl: 'https://im.rediff.com/getahead/2016/oct/27kaju-katli.jpg?w=670&h=900', stock: 50, isAvailable: true },
    { name: 'Gulab Jamun', price: 400, description: 'Soft, deep-fried dumplings soaked in rose-flavored sugar syrup.', imageUrl: 'https://cdn.pixabay.com/photo/2021/11/01/15/52/gulab-jamun-6760822_1280.jpg', stock: 100, isAvailable: true },
    { name: 'Rasgulla', price: 350, description: 'Spongy cottage cheese balls cooked in light sugar syrup.', imageUrl: 'https://cdn.pixabay.com/photo/2023/10/24/16/09/rasgulla-8338575_1280.jpg', stock: 80, isAvailable: true },
    { name: 'Motichoor Ladoo', price: 500, description: 'Sweet pearls of gram flour formed into balls.', imageUrl: 'https://cdn.pixabay.com/photo/2023/10/25/11/53/motichoor-laddoo-8339871_1280.jpg', stock: 60, isAvailable: true },
  ];

  for (const sweet of sweets) {
    await prisma.sweet.create({ data: sweet });
  }
  console.log('Sweets seeded!');

  // Seed Merchant Config
  const configs = [
    { key: 'PAYMENT_UPI', value: true, description: 'Enable UPI Payment' },
    { key: 'PAYMENT_CARD', value: true, description: 'Enable Credit/Debit Card Payment' },
    { key: 'PAYMENT_COD', value: true, description: 'Enable Cash on Delivery' },
  ];

  for (const config of configs) {
    await prisma.merchantConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log('Merchant Configuration seeded!');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
