import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productVehicle.deleteMany();
  await prisma.specification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vehicleGeneration.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleBrand.deleteMany();

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
