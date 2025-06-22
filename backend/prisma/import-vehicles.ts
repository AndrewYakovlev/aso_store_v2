import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CarModel {
  id: string;
  name: string;
  'cyrillic-name': string;
  class: string;
  'year-from': number;
  'year-to': number | null;
  path: {
    'mark-id': string;
  };
}

interface CarBrand {
  id: string;
  name: string;
  'cyrillic-name': string;
  popular: boolean;
  country: string;
  models: CarModel[];
}

// Функция для создания slug из названия
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Функция для получения уникального slug для марки
async function getUniqueBrandSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.vehicleBrand.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Функция для получения уникального slug для модели
async function getUniqueModelSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.vehicleModel.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function importVehicles() {
  try {
    // Читаем файл с данными
    const dataPath = path.join(__dirname, '../../files/cars.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const brands: CarBrand[] = JSON.parse(rawData);

    console.log(`Найдено ${brands.length} марок автомобилей для импорта`);

    // Счетчики для отчета
    let brandsCreated = 0;
    let modelsCreated = 0;

    // Импортируем марки и модели
    for (const brand of brands) {
      try {
        // Проверяем, существует ли марка
        let vehicleBrand: Awaited<ReturnType<typeof prisma.vehicleBrand.findUnique>> = await prisma.vehicleBrand.findUnique({
          where: { externalId: brand.id },
        });

        if (!vehicleBrand) {
          // Если марка не существует, создаем с уникальным slug
          const baseSlug = createSlug(brand.name);
          const uniqueSlug = await getUniqueBrandSlug(baseSlug);

          vehicleBrand = await prisma.vehicleBrand.create({
            data: {
              externalId: brand.id,
              name: brand.name,
              nameCyrillic: brand['cyrillic-name'],
              slug: uniqueSlug,
              country: brand.country,
              popular: brand.popular,
              sortOrder: brand.popular ? 0 : 100, // Популярные марки сверху
            },
          });
        } else {
          // Если существует, обновляем данные (кроме slug)
          vehicleBrand = await prisma.vehicleBrand.update({
            where: { externalId: brand.id },
            data: {
              name: brand.name,
              nameCyrillic: brand['cyrillic-name'],
              country: brand.country,
              popular: brand.popular,
            },
          });
        }

        brandsCreated++;
        console.log(`✓ Марка ${brand.name} (${brand['cyrillic-name']})`);

        // Импортируем модели марки
        for (const model of brand.models) {
          try {
            // Проверяем, существует ли модель
            const existingModel = await prisma.vehicleModel.findUnique({
              where: { externalId: model.id },
            });

            if (!existingModel) {
              // Если модель не существует, создаем с уникальным slug
              const baseSlug = createSlug(`${brand.name}-${model.name}`);
              const uniqueSlug = await getUniqueModelSlug(baseSlug);

              await prisma.vehicleModel.create({
                data: {
                  externalId: model.id,
                  brandId: vehicleBrand.id,
                  name: model.name,
                  nameCyrillic: model['cyrillic-name'],
                  slug: uniqueSlug,
                  class: model.class,
                  yearFrom: model['year-from'],
                  yearTo: model['year-to'],
                  sortOrder: 0,
                },
              });
            } else {
              // Если существует, обновляем данные (кроме slug)
              await prisma.vehicleModel.update({
                where: { externalId: model.id },
                data: {
                  name: model.name,
                  nameCyrillic: model['cyrillic-name'],
                  class: model.class,
                  yearFrom: model['year-from'],
                  yearTo: model['year-to'],
                },
              });
            }

            modelsCreated++;
          } catch (error) {
            console.error(
              `  ✗ Ошибка при импорте модели ${model.name}:`,
              error,
            );
          }
        }
      } catch (error) {
        console.error(`✗ Ошибка при импорте марки ${brand.name}:`, error);
      }
    }

    console.log('\n=== Импорт завершен ===');
    console.log(`Марок импортировано: ${brandsCreated}`);
    console.log(`Моделей импортировано: ${modelsCreated}`);

    // Обновляем порядок сортировки для популярных марок
    const popularBrands = [
      'Toyota',
      'Volkswagen',
      'Mercedes-Benz',
      'BMW',
      'Audi',
      'Ford',
      'Nissan',
      'Hyundai',
      'Kia',
      'Mazda',
      'Skoda',
      'Renault',
      'Mitsubishi',
      'Honda',
      'Lexus',
    ];

    for (let i = 0; i < popularBrands.length; i++) {
      await prisma.vehicleBrand.updateMany({
        where: { name: popularBrands[i] },
        data: {
          popular: true,
          sortOrder: i,
        },
      });
    }

    console.log('\n✓ Порядок сортировки популярных марок обновлен');
  } catch (error) {
    console.error('Критическая ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем импорт
importVehicles()
  .then(() => console.log('\nСкрипт завершен'))
  .catch((error) => {
    console.error('Ошибка выполнения скрипта:', error);
    process.exit(1);
  });
