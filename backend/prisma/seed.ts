import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { phone: '+79999999999' },
  });

  if (!existingAdmin) {
    console.log('Creating admin user...');

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        phone: '+79999999999',
        firstName: 'Админ',
        lastName: 'Администратор',
        role: UserRole.ADMIN,
        isPhoneVerified: true,
      },
    });

    console.log('Admin user created:', adminUser.phone);
  } else {
    console.log('Admin user already exists:', existingAdmin.phone);
  }

  // Create order statuses
  console.log('Seeding order statuses...');

  // Check if order statuses already exist
  const existingStatuses = await prisma.orderStatus.count();

  if (existingStatuses === 0) {
    await prisma.orderStatus.createMany({
      data: [
        {
          code: 'new',
          name: 'Новый',
          sortOrder: 1,
          isActive: true,
        },
        {
          code: 'processing',
          name: 'В обработке',
          sortOrder: 2,
          isActive: true,
        },
        {
          code: 'confirmed',
          name: 'Подтвержден',
          sortOrder: 3,
          isActive: true,
        },
        {
          code: 'shipped',
          name: 'Отправлен',
          sortOrder: 4,
          isActive: true,
        },
        {
          code: 'delivered',
          name: 'Доставлен',
          sortOrder: 5,
          isActive: true,
        },
        {
          code: 'completed',
          name: 'Завершен',
          sortOrder: 6,
          isActive: true,
        },
        {
          code: 'cancelled',
          name: 'Отменен',
          sortOrder: 7,
          isActive: true,
        },
      ],
    });
    console.log('Order statuses created');
  } else {
    console.log('Order statuses already exist');
  }

  // Create delivery methods
  console.log('Seeding delivery methods...');

  // Check if delivery methods already exist
  const existingDeliveryMethods = await prisma.deliveryMethod.count();

  if (existingDeliveryMethods === 0) {
    await prisma.deliveryMethod.createMany({
      data: [
        {
          code: 'pickup',
          name: 'Самовывоз',
          description:
            'Самовывоз из магазина по адресу: г. Москва, ул. Автозапчастей, д. 1',
          price: 0,
          isActive: true,
        },
        {
          code: 'courier',
          name: 'Курьерская доставка',
          description: 'Доставка курьером по Москве в течение 1-2 дней',
          price: 500,
          isActive: true,
        },
        {
          code: 'post',
          name: 'Почта России',
          description: 'Доставка Почтой России по всей России',
          price: 350,
          isActive: true,
        },
        {
          code: 'cdek',
          name: 'СДЭК',
          description: 'Доставка транспортной компанией СДЭК',
          price: 400,
          isActive: true,
        },
      ],
    });
    console.log('Delivery methods created');
  } else {
    console.log('Delivery methods already exist');
  }

  // Create payment methods
  console.log('Seeding payment methods...');

  // Check if payment methods already exist
  const existingPaymentMethods = await prisma.paymentMethod.count();

  if (existingPaymentMethods === 0) {
    await prisma.paymentMethod.createMany({
      data: [
        {
          code: 'cash',
          name: 'Наличными при получении',
          description: 'Оплата наличными курьеру или в магазине',
          isActive: true,
        },
        {
          code: 'card',
          name: 'Банковской картой',
          description: 'Оплата банковской картой онлайн',
          isActive: true,
        },
        {
          code: 'sbp',
          name: 'СБП (Система быстрых платежей)',
          description: 'Оплата через систему быстрых платежей',
          isActive: true,
        },
        {
          code: 'invoice',
          name: 'Счет для юридических лиц',
          description: 'Выставление счета для оплаты юридическими лицами',
          isActive: true,
        },
      ],
    });
    console.log('Payment methods created');
  } else {
    console.log('Payment methods already exist');
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
