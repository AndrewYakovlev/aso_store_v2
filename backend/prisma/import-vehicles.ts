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
    .replace(/[^\w\-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
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
        // Создаем или обновляем марку
        const vehicleBrand = await prisma.vehicleBrand.upsert({
          where: { externalId: brand.id },
          update: {
            name: brand.name,
            nameCyrillic: brand['cyrillic-name'],
            country: brand.country,
            popular: brand.popular,
          },
          create: {
            externalId: brand.id,
            name: brand.name,
            nameCyrillic: brand['cyrillic-name'],
            slug: createSlug(brand.name),
            country: brand.country,
            popular: brand.popular,
            sortOrder: brand.popular ? 0 : 100, // Популярные марки сверху
          },
        });

        brandsCreated++;
        console.log(`✓ Марка ${brand.name} (${brand['cyrillic-name']})`);

        // Импортируем модели марки
        for (const model of brand.models) {
          try {
            await prisma.vehicleModel.upsert({
              where: { externalId: model.id },
              update: {
                name: model.name,
                nameCyrillic: model['cyrillic-name'],
                class: model.class,
                yearFrom: model['year-from'],
                yearTo: model['year-to'],
              },
              create: {
                externalId: model.id,
                brandId: vehicleBrand.id,
                name: model.name,
                nameCyrillic: model['cyrillic-name'],
                slug: createSlug(`${brand.name}-${model.name}`),
                class: model.class,
                yearFrom: model['year-from'],
                yearTo: model['year-to'],
                sortOrder: 0,
              },
            });

            modelsCreated++;
          } catch (error) {
            console.error(`  ✗ Ошибка при импорте модели ${model.name}:`, error);
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
      'Toyota', 'Volkswagen', 'Mercedes-Benz', 'BMW', 'Audi', 
      'Ford', 'Nissan', 'Hyundai', 'Kia', 'Mazda',
      'Skoda', 'Renault', 'Mitsubishi', 'Honda', 'Lexus'
    ];

    for (let i = 0; i < popularBrands.length; i++) {
      await prisma.vehicleBrand.updateMany({
        where: { name: popularBrands[i] },
        data: { 
          popular: true,
          sortOrder: i 
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