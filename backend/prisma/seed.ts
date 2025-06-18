import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productVehicle.deleteMany();
  await prisma.specification.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vehicleGeneration.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleBrand.deleteMany();
  await prisma.orderStatus.deleteMany();
  await prisma.deliveryMethod.deleteMany();
  await prisma.paymentMethod.deleteMany();

  console.log('Seeding categories...');

  // Create root categories
  const oilsCategory = await prisma.category.create({
    data: {
      name: 'Масла и технические жидкости',
      slug: 'masla-i-tekhnicheskie-zhidkosti',
      description:
        'Моторные масла, трансмиссионные жидкости, антифризы и другие технические жидкости',
      isActive: true,
      sortOrder: 1,
    },
  });

  const filtersCategory = await prisma.category.create({
    data: {
      name: 'Фильтры',
      slug: 'filtry',
      description: 'Воздушные, масляные, топливные, салонные фильтры',
      isActive: true,
      sortOrder: 2,
    },
  });

  const brakesCategory = await prisma.category.create({
    data: {
      name: 'Тормозная система',
      slug: 'tormoznaya-sistema',
      description: 'Тормозные колодки, диски, барабаны, тормозная жидкость',
      isActive: true,
      sortOrder: 3,
    },
  });

  const suspensionCategory = await prisma.category.create({
    data: {
      name: 'Подвеска',
      slug: 'podveska',
      description: 'Амортизаторы, стойки, пружины, рычаги',
      isActive: true,
      sortOrder: 4,
    },
  });

  const engineCategory = await prisma.category.create({
    data: {
      name: 'Двигатель',
      slug: 'dvigatel',
      description: 'Детали двигателя, ремни, свечи зажигания',
      isActive: true,
      sortOrder: 5,
    },
  });

  const electricalCategory = await prisma.category.create({
    data: {
      name: 'Электрика',
      slug: 'elektrika',
      description: 'Аккумуляторы, генераторы, стартеры, лампы',
      isActive: true,
      sortOrder: 6,
    },
  });

  // Create subcategories for oils
  await prisma.category.createMany({
    data: [
      {
        name: 'Моторные масла',
        slug: 'motornye-masla',
        description:
          'Синтетические, полусинтетические и минеральные моторные масла',
        parentId: oilsCategory.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Трансмиссионные масла',
        slug: 'transmissionnye-masla',
        description: 'Масла для МКПП, АКПП, редукторов',
        parentId: oilsCategory.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Антифризы',
        slug: 'antifrizy',
        description: 'Охлаждающие жидкости для двигателя',
        parentId: oilsCategory.id,
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Тормозные жидкости',
        slug: 'tormoznye-zhidkosti',
        description: 'DOT3, DOT4, DOT5 тормозные жидкости',
        parentId: oilsCategory.id,
        isActive: true,
        sortOrder: 4,
      },
    ],
  });

  // Create subcategories for filters
  await prisma.category.createMany({
    data: [
      {
        name: 'Воздушные фильтры',
        slug: 'vozdushnye-filtry',
        description: 'Фильтры воздуха для двигателя',
        parentId: filtersCategory.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Масляные фильтры',
        slug: 'maslyanye-filtry',
        description: 'Фильтры моторного масла',
        parentId: filtersCategory.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Топливные фильтры',
        slug: 'toplivnye-filtry',
        description: 'Фильтры топлива для бензиновых и дизельных двигателей',
        parentId: filtersCategory.id,
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Салонные фильтры',
        slug: 'salonnye-filtry',
        description: 'Фильтры салона, угольные фильтры',
        parentId: filtersCategory.id,
        isActive: true,
        sortOrder: 4,
      },
    ],
  });

  // Create subcategories for brakes
  await prisma.category.createMany({
    data: [
      {
        name: 'Тормозные колодки',
        slug: 'tormoznye-kolodki',
        description: 'Передние и задние тормозные колодки',
        parentId: brakesCategory.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Тормозные диски',
        slug: 'tormoznye-diski',
        description: 'Вентилируемые и невентилируемые тормозные диски',
        parentId: brakesCategory.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Тормозные барабаны',
        slug: 'tormoznye-barabany',
        description: 'Барабаны для барабанных тормозов',
        parentId: brakesCategory.id,
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  // Create subcategories for suspension
  await prisma.category.createMany({
    data: [
      {
        name: 'Амортизаторы',
        slug: 'amortizatory',
        description: 'Передние и задние амортизаторы',
        parentId: suspensionCategory.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Стойки стабилизатора',
        slug: 'stoyki-stabilizatora',
        description: 'Стойки и втулки стабилизатора',
        parentId: suspensionCategory.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Пружины',
        slug: 'pruzhiny',
        description: 'Пружины подвески',
        parentId: suspensionCategory.id,
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Рычаги подвески',
        slug: 'rychagi-podveski',
        description: 'Верхние и нижние рычаги',
        parentId: suspensionCategory.id,
        isActive: true,
        sortOrder: 4,
      },
    ],
  });

  // Create vehicle brands
  console.log('Seeding vehicle brands...');

  const toyota = await prisma.vehicleBrand.create({
    data: { name: 'Toyota' },
  });

  const volkswagen = await prisma.vehicleBrand.create({
    data: { name: 'Volkswagen' },
  });

  const mercedes = await prisma.vehicleBrand.create({
    data: { name: 'Mercedes-Benz' },
  });

  const bmw = await prisma.vehicleBrand.create({
    data: { name: 'BMW' },
  });

  const lada = await prisma.vehicleBrand.create({
    data: { name: 'Lada' },
  });

  // Create vehicle models
  console.log('Seeding vehicle models...');

  const camry = await prisma.vehicleModel.create({
    data: {
      brandId: toyota.id,
      name: 'Camry',
    },
  });

  const corolla = await prisma.vehicleModel.create({
    data: {
      brandId: toyota.id,
      name: 'Corolla',
    },
  });

  const polo = await prisma.vehicleModel.create({
    data: {
      brandId: volkswagen.id,
      name: 'Polo',
    },
  });

  const vesta = await prisma.vehicleModel.create({
    data: {
      brandId: lada.id,
      name: 'Vesta',
    },
  });

  // Create vehicle generations
  console.log('Seeding vehicle generations...');

  await prisma.vehicleGeneration.createMany({
    data: [
      {
        modelId: camry.id,
        name: 'XV70',
        yearFrom: 2017,
        yearTo: null,
      },
      {
        modelId: camry.id,
        name: 'XV50',
        yearFrom: 2011,
        yearTo: 2017,
      },
      {
        modelId: corolla.id,
        name: 'E210',
        yearFrom: 2019,
        yearTo: null,
      },
      {
        modelId: polo.id,
        name: 'Mk6',
        yearFrom: 2020,
        yearTo: null,
      },
      {
        modelId: vesta.id,
        name: 'I',
        yearFrom: 2015,
        yearTo: null,
      },
    ],
  });

  // Create products
  console.log('Seeding products...');
  
  // Get some categories for products
  const motorOilsCat = await prisma.category.findUnique({
    where: { slug: 'motornye-masla' },
  });
  const oilFiltersCat = await prisma.category.findUnique({
    where: { slug: 'maslyanye-filtry' },
  });
  const airFiltersCat = await prisma.category.findUnique({
    where: { slug: 'vozdushnye-filtry' },
  });
  const brakePadsCat = await prisma.category.findUnique({
    where: { slug: 'tormoznye-kolodki' },
  });
  const sparkPlugsCat = await prisma.category.findUnique({
    where: { slug: 'dvigatel' },
  });

  // Create motor oils
  const mobil1 = await prisma.product.create({
    data: {
      sku: 'MOB-152083',
      name: 'Mobil 1 ESP 5W-30',
      slug: 'mobil-1-esp-5w-30',
      description: 'Полностью синтетическое моторное масло Mobil 1 ESP 5W-30 разработано для обеспечения исключительной чистоты двигателя, защиты от износа и общих рабочих характеристик.',
      price: 3500,
      stock: 25,
      isActive: true,
      images: ['/images/products/mobil-1-esp-5w-30.jpg'],
      categories: {
        create: [
          { category: { connect: { id: motorOilsCat!.id } } },
          { category: { connect: { id: oilsCategory.id } } },
        ],
      },
    },
  });

  const castrol = await prisma.product.create({
    data: {
      sku: 'CAS-15669E',
      name: 'Castrol EDGE 5W-40',
      slug: 'castrol-edge-5w-40',
      description: 'Castrol EDGE 5W-40 - полностью синтетическое моторное масло, усиленное титаном для максимальной производительности двигателя.',
      price: 3200,
      stock: 30,
      isActive: true,
      images: ['/images/products/castrol-edge-5w-40.jpg'],
      categories: {
        create: [
          { category: { connect: { id: motorOilsCat!.id } } },
          { category: { connect: { id: oilsCategory.id } } },
        ],
      },
    },
  });

  const shell = await prisma.product.create({
    data: {
      sku: 'SHL-550046270',
      name: 'Shell Helix Ultra 5W-40',
      slug: 'shell-helix-ultra-5w-40',
      description: 'Полностью синтетическое моторное масло Shell Helix Ultra 5W-40 обеспечивает превосходную защиту и очистку двигателя.',
      price: 2900,
      stock: 40,
      isActive: true,
      images: ['/images/products/shell-helix-ultra-5w-40.jpg'],
      categories: {
        create: [
          { category: { connect: { id: motorOilsCat!.id } } },
          { category: { connect: { id: oilsCategory.id } } },
        ],
      },
    },
  });

  // Create oil filters
  const mannFilter = await prisma.product.create({
    data: {
      sku: 'MAN-W71252',
      name: 'MANN-FILTER W 712/52',
      slug: 'mann-filter-w-712-52',
      description: 'Масляный фильтр MANN-FILTER W 712/52 для автомобилей VAG группы. Высококачественный фильтр для надежной защиты двигателя.',
      price: 450,
      stock: 100,
      isActive: true,
      images: ['/images/products/mann-filter-w-712-52.jpg'],
      categories: {
        create: [
          { category: { connect: { id: oilFiltersCat!.id } } },
          { category: { connect: { id: filtersCategory.id } } },
        ],
      },
    },
  });

  const boschOilFilter = await prisma.product.create({
    data: {
      sku: 'BSH-0451103316',
      name: 'Bosch 0 451 103 316',
      slug: 'bosch-0-451-103-316',
      description: 'Масляный фильтр Bosch для широкого спектра автомобилей. Обеспечивает эффективную фильтрацию моторного масла.',
      price: 380,
      stock: 80,
      isActive: true,
      images: ['/images/products/bosch-oil-filter.jpg'],
      categories: {
        create: [
          { category: { connect: { id: oilFiltersCat!.id } } },
          { category: { connect: { id: filtersCategory.id } } },
        ],
      },
    },
  });

  // Create air filters
  const mannAirFilter = await prisma.product.create({
    data: {
      sku: 'MAN-C27192',
      name: 'MANN-FILTER C 27 192/1',
      slug: 'mann-filter-c-27-192-1',
      description: 'Воздушный фильтр MANN-FILTER для эффективной очистки воздуха, поступающего в двигатель.',
      price: 650,
      stock: 60,
      isActive: true,
      images: ['/images/products/mann-air-filter.jpg'],
      categories: {
        create: [
          { category: { connect: { id: airFiltersCat!.id } } },
          { category: { connect: { id: filtersCategory.id } } },
        ],
      },
    },
  });

  // Create brake pads
  const brembo = await prisma.product.create({
    data: {
      sku: 'BRM-P85020',
      name: 'Brembo P 85 020',
      slug: 'brembo-p-85-020',
      description: 'Передние тормозные колодки Brembo для высокой эффективности торможения и долговечности.',
      price: 3800,
      stock: 35,
      isActive: true,
      images: ['/images/products/brembo-brake-pads.jpg'],
      categories: {
        create: [
          { category: { connect: { id: brakePadsCat!.id } } },
          { category: { connect: { id: brakesCategory.id } } },
        ],
      },
    },
  });

  const ate = await prisma.product.create({
    data: {
      sku: 'ATE-13046072192',
      name: 'ATE 13.0460-7219.2',
      slug: 'ate-13-0460-7219-2',
      description: 'Комплект тормозных колодок ATE с высоким коэффициентом трения для безопасного торможения.',
      price: 2500,
      stock: 50,
      isActive: true,
      images: ['/images/products/ate-brake-pads.jpg'],
      categories: {
        create: [
          { category: { connect: { id: brakePadsCat!.id } } },
          { category: { connect: { id: brakesCategory.id } } },
        ],
      },
    },
  });

  // Create spark plugs
  const ngk = await prisma.product.create({
    data: {
      sku: 'NGK-BKR6EK',
      name: 'NGK BKR6EK',
      slug: 'ngk-bkr6ek',
      description: 'Свечи зажигания NGK с медным электродом для надежного воспламенения топливной смеси.',
      price: 320,
      stock: 200,
      isActive: true,
      images: ['/images/products/ngk-spark-plugs.jpg'],
      categories: {
        create: [
          { category: { connect: { id: sparkPlugsCat!.id } } },
        ],
      },
    },
  });

  const boschSparkPlugs = await prisma.product.create({
    data: {
      sku: 'BSH-0242240593',
      name: 'Bosch FR6KI332S',
      slug: 'bosch-fr6ki332s',
      description: 'Иридиевые свечи зажигания Bosch для увеличенного срока службы и стабильной работы двигателя.',
      price: 850,
      stock: 120,
      isActive: true,
      images: ['/images/products/bosch-spark-plugs.jpg'],
      categories: {
        create: [
          { category: { connect: { id: sparkPlugsCat!.id } } },
        ],
      },
    },
  });

  // Create products with multiple categories
  const universalOil = await prisma.product.create({
    data: {
      sku: 'LQM-3707',
      name: 'Liqui Moly Top Tec 4200 5W-30',
      slug: 'liqui-moly-top-tec-4200-5w-30',
      description: 'Универсальное синтетическое масло Liqui Moly для бензиновых и дизельных двигателей.',
      price: 3300,
      stock: 45,
      isActive: true,
      images: ['/images/products/liqui-moly-5w-30.jpg'],
      categories: {
        create: [
          { category: { connect: { id: motorOilsCat!.id } } },
          { category: { connect: { id: oilsCategory.id } } },
          { category: { connect: { id: engineCategory.id } } },
        ],
      },
    },
  });

  // Add specifications to some products
  await prisma.specification.createMany({
    data: [
      { productId: mobil1.id, name: 'Вязкость', value: '5W-30' },
      { productId: mobil1.id, name: 'Объем', value: '4л' },
      { productId: mobil1.id, name: 'Тип', value: 'Синтетическое' },
      { productId: mobil1.id, name: 'Спецификация API', value: 'SN/CF' },
      { productId: mobil1.id, name: 'Спецификация ACEA', value: 'C2/C3' },
      
      { productId: mannFilter.id, name: 'Высота', value: '65 мм' },
      { productId: mannFilter.id, name: 'Диаметр', value: '72 мм' },
      { productId: mannFilter.id, name: 'Резьба', value: 'M20x1.5' },
      
      { productId: brembo.id, name: 'Толщина', value: '19.5 мм' },
      { productId: brembo.id, name: 'Высота', value: '72.9 мм' },
      { productId: brembo.id, name: 'Ширина', value: '156.4 мм' },
      { productId: brembo.id, name: 'Система', value: 'ATE' },
    ],
  });

  // Create order statuses
  console.log('Seeding order statuses...');
  
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

  // Create delivery methods
  console.log('Seeding delivery methods...');
  
  await prisma.deliveryMethod.createMany({
    data: [
      {
        code: 'pickup',
        name: 'Самовывоз',
        description: 'Самовывоз из магазина по адресу: г. Москва, ул. Автозапчастей, д. 1',
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

  // Create payment methods
  console.log('Seeding payment methods...');
  
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
