import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVehicle.deleteMany();
  await prisma.specification.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.attributeOption.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  // await prisma.vehicleGeneration.deleteMany(); // Will use new vehicle structure
  // Не удаляем марки и модели автомобилей - они импортируются отдельно
  // await prisma.vehicleModel.deleteMany();
  // await prisma.vehicleBrand.deleteMany();
  await prisma.orderStatus.deleteMany();
  await prisma.deliveryMethod.deleteMany();
  await prisma.paymentMethod.deleteMany();

  console.log('Seeding admin user...');
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      phone: '+79999999999',
      firstName: 'Админ',
      lastName: 'Администратор',
      role: 'ADMIN',
      isPhoneVerified: true,
    },
  });

  console.log('Admin user created:', adminUser.phone);

  console.log('Seeding brands...');

  // Create brands
  const mobil = await prisma.brand.create({
    data: {
      name: 'Mobil',
      slug: 'mobil',
      description: 'Американский производитель моторных масел и смазочных материалов',
      country: 'США',
      isActive: true,
      sortOrder: 1,
    },
  });

  const castrol = await prisma.brand.create({
    data: {
      name: 'Castrol',
      slug: 'castrol',
      description: 'Британский производитель смазочных материалов премиум-класса',
      country: 'Великобритания',
      website: 'https://www.castrol.com',
      isActive: true,
      sortOrder: 2,
    },
  });

  const shellBrand = await prisma.brand.create({
    data: {
      name: 'Shell',
      slug: 'shell',
      description: 'Нидерландско-британская нефтегазовая компания',
      country: 'Нидерланды',
      website: 'https://www.shell.com',
      isActive: true,
      sortOrder: 3,
    },
  });

  const liquiMoly = await prisma.brand.create({
    data: {
      name: 'Liqui Moly',
      slug: 'liqui-moly',
      description: 'Немецкий производитель масел, смазок и присадок',
      country: 'Германия',
      website: 'https://www.liqui-moly.com',
      isActive: true,
      sortOrder: 4,
    },
  });

  const mannFilterBrand = await prisma.brand.create({
    data: {
      name: 'MANN-FILTER',
      slug: 'mann-filter',
      description: 'Немецкий производитель фильтров для автомобилей',
      country: 'Германия',
      website: 'https://www.mann-filter.com',
      isActive: true,
      sortOrder: 5,
    },
  });

  const boschBrand = await prisma.brand.create({
    data: {
      name: 'Bosch',
      slug: 'bosch',
      description: 'Немецкая инженерная и технологическая компания',
      country: 'Германия',
      website: 'https://www.bosch.com',
      isActive: true,
      sortOrder: 6,
    },
  });

  const bremboBrand = await prisma.brand.create({
    data: {
      name: 'Brembo',
      slug: 'brembo',
      description: 'Итальянский производитель тормозных систем',
      country: 'Италия',
      website: 'https://www.brembo.com',
      isActive: true,
      sortOrder: 7,
    },
  });

  const ateBrand = await prisma.brand.create({
    data: {
      name: 'ATE',
      slug: 'ate',
      description: 'Немецкий производитель тормозных систем',
      country: 'Германия',
      isActive: true,
      sortOrder: 8,
    },
  });

  const ngkBrand = await prisma.brand.create({
    data: {
      name: 'NGK',
      slug: 'ngk',
      description: 'Японский производитель свечей зажигания',
      country: 'Япония',
      website: 'https://www.ngk.com',
      isActive: true,
      sortOrder: 9,
    },
  });

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

  // Vehicle data will be imported from cars.json using import-vehicles.ts script
  // Commented out old vehicle seed data
  /*
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
  */

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
      brandId: mobil.id,
      images: ['/images/products/mobil-1-esp-5w-30.jpg'],
      categories: {
        create: [
          { category: { connect: { id: motorOilsCat!.id } } },
          { category: { connect: { id: oilsCategory.id } } },
        ],
      },
    },
  });

  const castrolProduct = await prisma.product.create({
    data: {
      sku: 'CAS-15669E',
      name: 'Castrol EDGE 5W-40',
      slug: 'castrol-edge-5w-40',
      description: 'Castrol EDGE 5W-40 - полностью синтетическое моторное масло, усиленное титаном для максимальной производительности двигателя.',
      price: 3200,
      stock: 30,
      isActive: true,
      brandId: castrol.id,
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
      brandId: shellBrand.id,
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
      brandId: mannFilterBrand.id,
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
      brandId: boschBrand.id,
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
      brandId: mannFilterBrand.id,
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
  const bremboProduct = await prisma.product.create({
    data: {
      sku: 'BRM-P85020',
      name: 'Brembo P 85 020',
      slug: 'brembo-p-85-020',
      description: 'Передние тормозные колодки Brembo для высокой эффективности торможения и долговечности.',
      price: 3800,
      stock: 35,
      isActive: true,
      brandId: bremboBrand.id,
      images: ['/images/products/brembo-brake-pads.jpg'],
      categories: {
        create: [
          { category: { connect: { id: brakePadsCat!.id } } },
          { category: { connect: { id: brakesCategory.id } } },
        ],
      },
    },
  });

  const ateProduct = await prisma.product.create({
    data: {
      sku: 'ATE-13046072192',
      name: 'ATE 13.0460-7219.2',
      slug: 'ate-13-0460-7219-2',
      description: 'Комплект тормозных колодок ATE с высоким коэффициентом трения для безопасного торможения.',
      price: 2500,
      stock: 50,
      isActive: true,
      brandId: ateBrand.id,
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
  await prisma.product.create({
    data: {
      sku: 'NGK-BKR6EK',
      name: 'NGK BKR6EK',
      slug: 'ngk-bkr6ek',
      description: 'Свечи зажигания NGK с медным электродом для надежного воспламенения топливной смеси.',
      price: 320,
      stock: 200,
      isActive: true,
      brandId: ngkBrand.id,
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
      brandId: castrol.id,
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
      brandId: liquiMoly.id,
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
      
      { productId: bremboProduct.id, name: 'Толщина', value: '19.5 мм' },
      { productId: bremboProduct.id, name: 'Высота', value: '72.9 мм' },
      { productId: bremboProduct.id, name: 'Ширина', value: '156.4 мм' },
      { productId: bremboProduct.id, name: 'Система', value: 'ATE' },
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

  // Create attributes
  console.log('Seeding attributes...');
  
  // Brand attribute - теперь бренды это отдельная сущность с brandId у товаров
  // const brandAttr = await prisma.attribute.create({
  //   data: {
  //     code: 'brand',
  //     name: 'Бренд',
  //     type: 'SELECT_ONE',
  //     isRequired: true,
  //     isFilterable: true,
  //     sortOrder: 1,
  //     options: {
  //       create: [
  //         { value: 'Mobil', sortOrder: 1 },
  //         { value: 'Castrol', sortOrder: 2 },
  //         { value: 'Shell', sortOrder: 3 },
  //         { value: 'Liqui Moly', sortOrder: 4 },
  //         { value: 'MANN-FILTER', sortOrder: 5 },
  //         { value: 'Bosch', sortOrder: 6 },
  //         { value: 'Brembo', sortOrder: 7 },
  //         { value: 'ATE', sortOrder: 8 },
  //         { value: 'NGK', sortOrder: 9 },
  //       ],
  //     },
  //   },
  // });

  // Viscosity attribute for oils
  const viscosityAttr = await prisma.attribute.create({
    data: {
      code: 'viscosity',
      name: 'Вязкость',
      type: 'SELECT_ONE',
      isRequired: true,
      isFilterable: true,
      sortOrder: 2,
      options: {
        create: [
          { value: '0W-20', sortOrder: 1 },
          { value: '0W-30', sortOrder: 2 },
          { value: '5W-30', sortOrder: 3 },
          { value: '5W-40', sortOrder: 4 },
          { value: '10W-40', sortOrder: 5 },
          { value: '15W-40', sortOrder: 6 },
        ],
      },
    },
  });

  // Volume attribute
  const volumeAttr = await prisma.attribute.create({
    data: {
      code: 'volume',
      name: 'Объем',
      type: 'NUMBER',
      unit: 'л',
      isRequired: false,
      isFilterable: true,
      sortOrder: 3,
    },
  });

  // Oil type attribute
  const oilTypeAttr = await prisma.attribute.create({
    data: {
      code: 'oil_type',
      name: 'Тип масла',
      type: 'SELECT_ONE',
      isRequired: true,
      isFilterable: true,
      sortOrder: 4,
      options: {
        create: [
          { value: 'Синтетическое', sortOrder: 1 },
          { value: 'Полусинтетическое', sortOrder: 2 },
          { value: 'Минеральное', sortOrder: 3 },
        ],
      },
    },
  });

  // Color attribute
  const colorAttr = await prisma.attribute.create({
    data: {
      code: 'color',
      name: 'Цвет',
      type: 'COLOR',
      isRequired: false,
      isFilterable: true,
      sortOrder: 5,
    },
  });

  // Features attribute (multiple select)
  const featuresAttr = await prisma.attribute.create({
    data: {
      code: 'features',
      name: 'Особенности',
      type: 'SELECT_MANY',
      isRequired: false,
      isFilterable: true,
      sortOrder: 6,
      options: {
        create: [
          { value: 'Для турбированных двигателей', sortOrder: 1 },
          { value: 'Энергосберегающее', sortOrder: 2 },
          { value: 'Для дизельных двигателей', sortOrder: 3 },
          { value: 'Для бензиновых двигателей', sortOrder: 4 },
          { value: 'С присадками', sortOrder: 5 },
          { value: 'Longlife', sortOrder: 6 },
        ],
      },
    },
  });

  // Height attribute (for filters)
  const heightAttr = await prisma.attribute.create({
    data: {
      code: 'height',
      name: 'Высота',
      type: 'NUMBER',
      unit: 'мм',
      isRequired: false,
      isFilterable: true,
      sortOrder: 7,
    },
  });

  // Diameter attribute (for filters)
  const diameterAttr = await prisma.attribute.create({
    data: {
      code: 'diameter',
      name: 'Диаметр',
      type: 'NUMBER',
      unit: 'мм',
      isRequired: false,
      isFilterable: false,
      sortOrder: 8,
    },
  });

  // Assign attributes to categories
  console.log('Assigning attributes to categories...');

  // Assign to motor oils category
  if (motorOilsCat) {
    await prisma.categoryAttribute.createMany({
      data: [
        // { categoryId: motorOilsCat.id, attributeId: brandAttr.id, isRequired: true, sortOrder: 1 },
        { categoryId: motorOilsCat.id, attributeId: viscosityAttr.id, isRequired: true, sortOrder: 1 },
        { categoryId: motorOilsCat.id, attributeId: volumeAttr.id, isRequired: false, sortOrder: 2 },
        { categoryId: motorOilsCat.id, attributeId: oilTypeAttr.id, isRequired: true, sortOrder: 3 },
        { categoryId: motorOilsCat.id, attributeId: featuresAttr.id, isRequired: false, sortOrder: 4 },
      ],
    });
  }

  // Assign to oil filters category
  if (oilFiltersCat) {
    await prisma.categoryAttribute.createMany({
      data: [
        // { categoryId: oilFiltersCat.id, attributeId: brandAttr.id, isRequired: true, sortOrder: 1 },
        { categoryId: oilFiltersCat.id, attributeId: heightAttr.id, isRequired: false, sortOrder: 1 },
        { categoryId: oilFiltersCat.id, attributeId: diameterAttr.id, isRequired: false, sortOrder: 2 },
      ],
    });
  }

  // Set product attributes
  console.log('Setting product attributes...');

  // Get attribute options
  // Бренды теперь отдельная сущность
  // const mobilOption = await prisma.attributeOption.findFirst({ where: { attributeId: brandAttr.id, value: 'Mobil' } });
  // const castrolOption = await prisma.attributeOption.findFirst({ where: { attributeId: brandAttr.id, value: 'Castrol' } });
  // const shellOption = await prisma.attributeOption.findFirst({ where: { attributeId: brandAttr.id, value: 'Shell' } });
  // const liquiMolyOption = await prisma.attributeOption.findFirst({ where: { attributeId: brandAttr.id, value: 'Liqui Moly' } });
  // const mannOption = await prisma.attributeOption.findFirst({ where: { attributeId: brandAttr.id, value: 'MANN-FILTER' } });
  // const boschOption = await prisma.attributeOption.findFirst({ where: { attributeId: brandAttr.id, value: 'Bosch' } });
  
  const viscosity5w30Option = await prisma.attributeOption.findFirst({ where: { attributeId: viscosityAttr.id, value: '5W-30' } });
  const viscosity5w40Option = await prisma.attributeOption.findFirst({ where: { attributeId: viscosityAttr.id, value: '5W-40' } });
  
  const syntheticOption = await prisma.attributeOption.findFirst({ where: { attributeId: oilTypeAttr.id, value: 'Синтетическое' } });
  
  const turboFeature = await prisma.attributeOption.findFirst({ where: { attributeId: featuresAttr.id, value: 'Для турбированных двигателей' } });
  const energySaveFeature = await prisma.attributeOption.findFirst({ where: { attributeId: featuresAttr.id, value: 'Энергосберегающее' } });
  const dieselFeature = await prisma.attributeOption.findFirst({ where: { attributeId: featuresAttr.id, value: 'Для дизельных двигателей' } });
  const petrolFeature = await prisma.attributeOption.findFirst({ where: { attributeId: featuresAttr.id, value: 'Для бензиновых двигателей' } });

  // Set attributes for Mobil 1
  if (viscosity5w30Option && syntheticOption) {
    await prisma.productAttribute.createMany({
      data: [
        // { productId: mobil1.id, attributeId: brandAttr.id, optionIds: [mobilOption.id] },
        { productId: mobil1.id, attributeId: viscosityAttr.id, optionIds: [viscosity5w30Option.id] },
        { productId: mobil1.id, attributeId: volumeAttr.id, numberValue: 4 },
        { productId: mobil1.id, attributeId: oilTypeAttr.id, optionIds: [syntheticOption.id] },
        { productId: mobil1.id, attributeId: featuresAttr.id, optionIds: [turboFeature!.id, energySaveFeature!.id, petrolFeature!.id] },
      ],
    });
  }

  // Set attributes for Castrol
  if (viscosity5w40Option && syntheticOption) {
    await prisma.productAttribute.createMany({
      data: [
        // { productId: castrolProduct.id, attributeId: brandAttr.id, optionIds: [castrolOption.id] },
        { productId: castrolProduct.id, attributeId: viscosityAttr.id, optionIds: [viscosity5w40Option.id] },
        { productId: castrolProduct.id, attributeId: volumeAttr.id, numberValue: 4 },
        { productId: castrolProduct.id, attributeId: oilTypeAttr.id, optionIds: [syntheticOption.id] },
        { productId: castrolProduct.id, attributeId: featuresAttr.id, optionIds: [turboFeature!.id, dieselFeature!.id, petrolFeature!.id] },
      ],
    });
  }

  // Set attributes for Shell
  if (viscosity5w40Option && syntheticOption) {
    await prisma.productAttribute.createMany({
      data: [
        // { productId: shell.id, attributeId: brandAttr.id, optionIds: [shellOption.id] },
        { productId: shell.id, attributeId: viscosityAttr.id, optionIds: [viscosity5w40Option.id] },
        { productId: shell.id, attributeId: volumeAttr.id, numberValue: 4 },
        { productId: shell.id, attributeId: oilTypeAttr.id, optionIds: [syntheticOption.id] },
        { productId: shell.id, attributeId: colorAttr.id, colorValue: '#FFD700' }, // Golden color for Shell
      ],
    });
  }

  // Set attributes for Liqui Moly
  if (viscosity5w30Option && syntheticOption) {
    await prisma.productAttribute.createMany({
      data: [
        // { productId: universalOil.id, attributeId: brandAttr.id, optionIds: [liquiMolyOption.id] },
        { productId: universalOil.id, attributeId: viscosityAttr.id, optionIds: [viscosity5w30Option.id] },
        { productId: universalOil.id, attributeId: volumeAttr.id, numberValue: 4 },
        { productId: universalOil.id, attributeId: oilTypeAttr.id, optionIds: [syntheticOption.id] },
        { productId: universalOil.id, attributeId: featuresAttr.id, optionIds: [dieselFeature!.id, petrolFeature!.id] },
      ],
    });
  }

  // Set attributes for MANN oil filter
  await prisma.productAttribute.createMany({
    data: [
      // { productId: mannFilter.id, attributeId: brandAttr.id, optionIds: [mannOption.id] },
        { productId: mannFilter.id, attributeId: heightAttr.id, numberValue: 65 },
        { productId: mannFilter.id, attributeId: diameterAttr.id, numberValue: 72 },
      ],
    });

  // Set attributes for Bosch oil filter
  await prisma.productAttribute.createMany({
    data: [
      // { productId: boschOilFilter.id, attributeId: brandAttr.id, optionIds: [boschOption.id] },
      { productId: boschOilFilter.id, attributeId: heightAttr.id, numberValue: 93 },
      { productId: boschOilFilter.id, attributeId: diameterAttr.id, numberValue: 76 },
    ],
  });

  // Add vehicle connections for products
  console.log('Adding vehicle connections for products...');

  // Get all vehicle models
  const allVehicleModels = await prisma.vehicleModel.findMany({
    include: { brand: true },
  });

  if (allVehicleModels.length === 0) {
    console.log('No vehicle models found. Please run import-vehicles script first.');
  } else {
    console.log(`Found ${allVehicleModels.length} vehicle models. Creating random connections...`);

    // Get all products
    const allProducts = await prisma.product.findMany();

    // Helper function to get random models
    const getRandomModels = (count: number) => {
      const shuffled = [...allVehicleModels].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Helper function to get random year range within model's range
    const getRandomYearRange = (model: any) => {
      const modelStartYear = model.yearFrom;
      const modelEndYear = model.yearTo || new Date().getFullYear();
      const range = modelEndYear - modelStartYear;
      
      if (range <= 0) {
        return { yearFrom: modelStartYear, yearTo: null };
      }
      
      const yearFrom = modelStartYear + Math.floor(Math.random() * (range * 0.5));
      const yearTo = Math.random() > 0.3 ? yearFrom + Math.floor(Math.random() * 10) + 2 : null;
      
      return {
        yearFrom,
        yearTo: yearTo && yearTo <= modelEndYear ? yearTo : null,
      };
    };

    // Create connections for each product
    for (const product of allProducts) {
      const numberOfConnections = Math.floor(Math.random() * 2) + 2; // 2-3 connections
      const randomModels = getRandomModels(numberOfConnections);

      for (const model of randomModels) {
        const { yearFrom, yearTo } = getRandomYearRange(model);
        
        try {
          await prisma.productVehicle.create({
            data: {
              productId: product.id,
              vehicleModelId: model.id,
              yearFrom,
              yearTo,
              fitmentNotes: `Подходит для ${model.brand.name} ${model.nameCyrillic || model.name}`,
              isUniversal: false,
            },
          });
          console.log(`Connected ${product.name} to ${model.brand.name} ${model.name}`);
        } catch (error) {
          console.error(`Failed to create connection for ${product.name} and ${model.name}:`, error);
        }
      }
    }
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
