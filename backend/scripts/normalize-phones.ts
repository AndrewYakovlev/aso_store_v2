import { PrismaClient } from '@prisma/client';
import { normalizePhone } from '../src/common/utils/phone.utils';

const prisma = new PrismaClient();

async function normalizePhones() {
  console.log('Starting phone normalization...');

  // Get all users with phones
  const allUsers = await prisma.user.findMany();
  const users = allUsers.filter((user) => user.phone !== null);

  console.log(`Found ${users.length} users with phone numbers`);

  let updated = 0;
  let errors = 0;

  for (const user of users) {
    if (!user.phone) continue;

    const normalizedPhone = normalizePhone(user.phone);

    if (normalizedPhone !== user.phone) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: normalizedPhone },
        });
        console.log(
          `Updated user ${user.id}: ${user.phone} -> ${normalizedPhone}`,
        );
        updated++;
      } catch (error) {
        console.error(`Failed to update user ${user.id}:`, error);
        errors++;
      }
    }
  }

  // Normalize phones in orders
  const allOrders = await prisma.order.findMany();
  const orders = allOrders.filter((order) => order.customerPhone !== null);

  console.log(`Found ${orders.length} orders with phone numbers`);

  for (const order of orders) {
    if (!order.customerPhone) continue;

    const normalizedPhone = normalizePhone(order.customerPhone);

    if (normalizedPhone !== order.customerPhone) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { customerPhone: normalizedPhone },
        });
        console.log(
          `Updated order ${order.orderNumber}: ${order.customerPhone} -> ${normalizedPhone}`,
        );
        updated++;
      } catch (error) {
        console.error(`Failed to update order ${order.id}:`, error);
        errors++;
      }
    }
  }

  console.log(`\nPhone normalization completed:`);
  console.log(`- Updated: ${updated} records`);
  console.log(`- Errors: ${errors}`);
}

normalizePhones()
  .catch((e) => {
    console.error('Error during phone normalization:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
