import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';
import { 
  ImportResultDto, 
  ImportDetailDto, 
  ImportPreviewDto, 
  ImportPreviewItemDto,
  CategoryMatchStatsDto,
  BrandMatchStatsDto
} from './dto/import-result.dto';
import { ImportOptionsDto } from './dto/import-options.dto';
import * as XLSX from 'xlsx';

interface ParsedProduct {
  row: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  originalData: any;
}

interface MatchResult {
  id: string;
  name: string;
  confidence: number;
}

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
  ) {}

  /**
   * Предварительный просмотр импорта товаров из Excel файла
   */
  async previewImport(buffer: Buffer): Promise<ImportPreviewDto> {
    try {
      const parsedData = this.parseExcelFile(buffer);
      
      if (parsedData.length === 0) {
        throw new BadRequestException('Файл не содержит данных для импорта');
      }

      // Анализируем первые 50 записей для предварительного просмотра
      const previewData = parsedData.slice(0, 50);
      
      // Загружаем категории и бренды для сопоставления
      const categories = await this.categoriesService.findAll(false);
      const brandsResponse = await this.brandsService.findAll({});
      const brands = brandsResponse.items;

      const preview: ImportPreviewItemDto[] = [];
      const categoryStats = new Map<string, number>();
      const brandStats = new Map<string, number>();

      for (const product of previewData) {
        const categoryMatch = this.findBestCategoryMatch(product.name, categories);
        const brandMatch = this.findBestBrandMatch(product.name, brands);

        preview.push({
          row: product.row,
          sku: product.sku,
          name: product.name,
          price: product.price,
          stock: product.stock,
          suggestedCategory: categoryMatch?.name,
          suggestedBrand: brandMatch?.name,
          categoryConfidence: categoryMatch?.confidence,
          brandConfidence: brandMatch?.confidence,
        });

        // Собираем статистику
        if (categoryMatch && categoryMatch.confidence >= 70) {
          categoryStats.set(categoryMatch.name, (categoryStats.get(categoryMatch.name) || 0) + 1);
        }
        if (brandMatch && brandMatch.confidence >= 70) {
          brandStats.set(brandMatch.name, (brandStats.get(brandMatch.name) || 0) + 1);
        }
      }

      // Формируем статистику категорий
      const categoryMatches: CategoryMatchStatsDto[] = Array.from(categoryStats.entries())
        .map(([name, count]) => ({
          categoryName: name,
          count,
          percentage: Math.round((count / previewData.length) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      // Формируем статистику брендов
      const brandMatches: BrandMatchStatsDto[] = Array.from(brandStats.entries())
        .map(([name, count]) => ({
          brandName: name,
          count,
          percentage: Math.round((count / previewData.length) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalRecords: parsedData.length,
        preview,
        categoryMatches,
        brandMatches,
      };

    } catch (error) {
      this.logger.error('Ошибка при предварительном просмотре импорта', error);
      throw new BadRequestException(`Ошибка при анализе файла: ${error.message}`);
    }
  }

  /**
   * Импорт товаров из Excel файла
   */
  async importProducts(buffer: Buffer, options: ImportOptionsDto = {}): Promise<ImportResultDto> {
    const result: ImportResultDto = {
      totalRecords: 0,
      createdProducts: 0,
      updatedProducts: 0,
      skippedRecords: 0,
      errors: 0,
      details: [],
      errorMessages: [],
    };

    try {
      const parsedData = this.parseExcelFile(buffer);
      result.totalRecords = parsedData.length;

      if (parsedData.length === 0) {
        throw new BadRequestException('Файл не содержит данных для импорта');
      }

      // Загружаем категории и бренды для сопоставления
      const categories = await this.categoriesService.findAll(false);
      const brandsResponse = await this.brandsService.findAll({});
      const brands = brandsResponse.items;

      // Обрабатываем каждый товар
      for (const product of parsedData) {
        try {
          const detail = await this.processProduct(product, categories, brands, options);
          result.details.push(detail);

          switch (detail.status) {
            case 'created':
              result.createdProducts++;
              break;
            case 'updated':
              result.updatedProducts++;
              break;
            case 'skipped':
              result.skippedRecords++;
              break;
            case 'error':
              result.errors++;
              result.errorMessages.push(`Строка ${detail.row}: ${detail.message}`);
              break;
          }

        } catch (error) {
          result.errors++;
          result.errorMessages.push(`Строка ${product.row}: ${error.message}`);
          
          if (!options.skipErrors) {
            throw error;
          }
        }
      }

      this.logger.log(`Импорт завершен: создано ${result.createdProducts}, обновлено ${result.updatedProducts}, ошибок ${result.errors}`);
      return result;

    } catch (error) {
      this.logger.error('Ошибка при импорте товаров', error);
      throw new BadRequestException(`Ошибка при импорте: ${error.message}`);
    }
  }

  /**
   * Парсинг Excel файла
   */
  private parseExcelFile(buffer: Buffer): ParsedProduct[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Читаем данные начиная с 4-й строки (где начинаются реальные данные)
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      range: 3, // Начинаем с строки 4 (индекс 3)
      defval: null 
    });

    const products: ParsedProduct[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      
      // Пропускаем строки без артикула или названия
      // Данные находятся в полях __EMPTY и __EMPTY_5
      if (!row['__EMPTY'] || !row['__EMPTY_5']) {
        continue;
      }

      // Пропускаем служебные строки
      if (row['__EMPTY'] === 'RUB' || row['__EMPTY'] === 'Включает НДС' || row['__EMPTY'] === 'Остаток') {
        continue;
      }

      const sku = String(row['__EMPTY']).trim();
      const name = String(row['__EMPTY_5']).trim();
      const stock = this.parseNumber(row['RUB']); // Остаток в поле RUB
      const price = this.parseNumber(row['__EMPTY_13']); // Цена в поле __EMPTY_13

      // Валидируем обязательные поля
      if (!sku || !name || price <= 0) {
        continue;
      }

      products.push({
        row: i + 4, // Реальный номер строки в Excel
        sku,
        name,
        price,
        stock: Math.max(0, stock), // Остаток не может быть отрицательным
        originalData: row,
      });
    }

    return products;
  }

  /**
   * Обработка одного товара
   */
  private async processProduct(
    product: ParsedProduct,
    categories: any[],
    brands: any[],
    options: ImportOptionsDto,
  ): Promise<ImportDetailDto> {
    // Проверяем, существует ли товар
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: product.sku },
    });

    if (existingProduct && !options.updateExisting) {
      return {
        row: product.row,
        sku: product.sku,
        name: product.name,
        status: 'skipped',
        message: 'Товар существует, обновление отключено',
      };
    }

    if (!existingProduct && !options.createNew) {
      return {
        row: product.row,
        sku: product.sku,
        name: product.name,
        status: 'skipped',
        message: 'Новый товар, создание отключено',
      };
    }

    // Ищем категорию и бренд
    let categoryId = options.defaultCategoryId;
    let brandId = options.defaultBrandId;
    let matchedCategory: string | undefined;
    let matchedBrand: string | undefined;

    if (options.autoMatchCategories) {
      const categoryMatch = this.findBestCategoryMatch(product.name, categories);
      if (categoryMatch && categoryMatch.confidence >= (options.confidenceThreshold || 70)) {
        categoryId = categoryMatch.id;
        matchedCategory = categoryMatch.name;
      }
    }

    if (options.autoMatchBrands) {
      const brandMatch = this.findBestBrandMatch(product.name, brands);
      if (brandMatch && brandMatch.confidence >= (options.confidenceThreshold || 70)) {
        brandId = brandMatch.id;
        matchedBrand = brandMatch.name;
      }
    }

    // Подготавливаем данные для создания/обновления
    const productData = {
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      isActive: true,
      categoryId,
      brandId,
      ...(existingProduct && !options.updatePrices && { price: existingProduct.price }),
      ...(existingProduct && !options.updateStock && { stock: existingProduct.stock }),
    };

    try {
      if (existingProduct) {
        // Обновляем существующий товар
        await this.prisma.product.update({
          where: { id: existingProduct.id },
          data: productData,
        });

        return {
          row: product.row,
          sku: product.sku,
          name: product.name,
          status: 'updated',
          message: 'Товар обновлен',
          matchedCategory,
          matchedBrand,
        };
      } else {
        // Создаем новый товар
        await this.prisma.product.create({
          data: {
            ...productData,
            slug: this.generateSlug(product.name),
          },
        });

        return {
          row: product.row,
          sku: product.sku,
          name: product.name,
          status: 'created',
          message: 'Товар создан',
          matchedCategory,
          matchedBrand,
        };
      }
    } catch (error) {
      throw new Error(`Ошибка при сохранении товара: ${error.message}`);
    }
  }

  /**
   * Поиск наиболее подходящей категории
   */
  private findBestCategoryMatch(productName: string, categories: any[]): MatchResult | null {
    const name = productName.toLowerCase();
    let bestMatch: MatchResult | null = null;
    let bestScore = 0;

    for (const category of categories) {
      const score = this.calculateMatchScore(name, category.name.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          id: category.id,
          name: category.name,
          confidence: Math.round(score),
        };
      }
    }

    return bestMatch && bestMatch.confidence >= 30 ? bestMatch : null;
  }

  /**
   * Поиск наиболее подходящего бренда
   */
  private findBestBrandMatch(productName: string, brands: any[]): MatchResult | null {
    const name = productName.toLowerCase();
    let bestMatch: MatchResult | null = null;
    let bestScore = 0;

    for (const brand of brands) {
      // Проверяем основное название бренда
      let score = this.calculateMatchScore(name, brand.name.toLowerCase());
      
      // Также проверяем альтернативные названия если есть
      if (brand.slug) {
        const slugScore = this.calculateMatchScore(name, brand.slug.toLowerCase());
        score = Math.max(score, slugScore);
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          id: brand.id,
          name: brand.name,
          confidence: Math.round(score),
        };
      }
    }

    return bestMatch && bestMatch.confidence >= 30 ? bestMatch : null;
  }

  /**
   * Вычисление релевантности совпадения
   */
  private calculateMatchScore(productName: string, targetName: string): number {
    // Точное совпадение
    if (productName.includes(targetName) || targetName.includes(productName)) {
      return 100;
    }

    // Совпадение слов
    const productWords = productName.split(/\s+/);
    const targetWords = targetName.split(/\s+/);
    
    let matchingWords = 0;
    for (const word of targetWords) {
      if (word.length > 2 && productWords.some(pw => pw.includes(word) || word.includes(pw))) {
        matchingWords++;
      }
    }

    if (matchingWords === 0) return 0;
    
    // Процент совпадающих слов
    return Math.min(95, (matchingWords / targetWords.length) * 100);
  }

  /**
   * Парсинг числовых значений
   */
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Генерация slug для товара
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[а-я]/g, (char) => {
        const map: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}