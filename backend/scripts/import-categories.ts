import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CategoryData {
  id: string;
  name: string;
  url: string;
  icon?: string;
  subcategories?: CategoryData[];
}

interface CatalogData {
  catalog: {
    categories: CategoryData[];
  };
}

async function importCategories() {
  try {
    console.log('Начинаем импорт категорий...');

    // Читаем JSON файл
    const filePath = path.join(__dirname, '../../files/categories.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: CatalogData = JSON.parse(fileContent);

    if (!data.catalog || !data.catalog.categories) {
      throw new Error('Неверная структура файла categories.json');
    }

    // Функция для создания категории с подкатегориями
    async function createCategory(
      category: CategoryData,
      parentId: string | null = null,
      depth: number = 0
    ): Promise<void> {
      try {
        // Проверяем, существует ли категория
        const existingCategory = await prisma.category.findFirst({
          where: {
            slug: category.id,
          },
        });

        if (existingCategory) {
          console.log(`${'  '.repeat(depth)}Категория "${category.name}" уже существует, пропускаем`);
        } else {
          // Создаем категорию
          const createdCategory = await prisma.category.create({
            data: {
              name: category.name,
              slug: category.id,
              description: `Категория ${category.name}`,
              isActive: true,
              parentId: parentId,
              sortOrder: 0,
            },
          });

          console.log(`${'  '.repeat(depth)}✅ Создана категория: ${category.name} (ID: ${createdCategory.id})`);
        }

        // Получаем ID категории для использования в подкатегориях
        const currentCategory = await prisma.category.findFirst({
          where: {
            slug: category.id,
          },
        });

        if (!currentCategory) {
          throw new Error(`Не удалось найти категорию с slug: ${category.id}`);
        }

        // Рекурсивно создаем подкатегории
        if (category.subcategories && category.subcategories.length > 0) {
          for (const subcategory of category.subcategories) {
            await createCategory(subcategory, currentCategory.id, depth + 1);
          }
        }
      } catch (error) {
        console.error(`Ошибка при создании категории "${category.name}":`, error);
      }
    }

    // Импортируем все категории верхнего уровня
    for (const category of data.catalog.categories) {
      await createCategory(category);
    }

    console.log('\n✅ Импорт категорий завершен!');

    // Выводим статистику
    const totalCategories = await prisma.category.count();
    const topLevelCategories = await prisma.category.count({
      where: { parentId: null },
    });

    console.log(`\nСтатистика:`);
    console.log(`- Всего категорий: ${totalCategories}`);
    console.log(`- Категорий верхнего уровня: ${topLevelCategories}`);
    console.log(`- Подкатегорий: ${totalCategories - topLevelCategories}`);

  } catch (error) {
    console.error('Ошибка при импорте категорий:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем импорт
importCategories();