import { ApiProperty } from '@nestjs/swagger';

export class ImportResultDto {
  @ApiProperty({ description: 'Общее количество записей в файле' })
  totalRecords: number;

  @ApiProperty({ description: 'Количество созданных товаров' })
  createdProducts: number;

  @ApiProperty({ description: 'Количество обновленных товаров' })
  updatedProducts: number;

  @ApiProperty({ description: 'Количество пропущенных записей' })
  skippedRecords: number;

  @ApiProperty({ description: 'Количество ошибок' })
  errors: number;

  @ApiProperty({ description: 'Детали обработки', type: [Object] })
  details: ImportDetailDto[];

  @ApiProperty({ description: 'Список ошибок', type: [String] })
  errorMessages: string[];
}

export class ImportDetailDto {
  @ApiProperty({ description: 'Номер строки в файле' })
  row: number;

  @ApiProperty({ description: 'Артикул товара' })
  sku: string;

  @ApiProperty({ description: 'Название товара' })
  name: string;

  @ApiProperty({ description: 'Статус обработки' })
  status: 'created' | 'updated' | 'skipped' | 'error';

  @ApiProperty({ description: 'Сообщение о результате' })
  message: string;

  @ApiProperty({ description: 'Найденная категория', required: false })
  matchedCategory?: string;

  @ApiProperty({ description: 'Найденный бренд', required: false })
  matchedBrand?: string;
}

export class ImportPreviewDto {
  @ApiProperty({ description: 'Общее количество записей в файле' })
  totalRecords: number;

  @ApiProperty({ description: 'Предварительный просмотр первых записей' })
  preview: ImportPreviewItemDto[];

  @ApiProperty({ description: 'Статистика категорий' })
  categoryMatches: CategoryMatchStatsDto[];

  @ApiProperty({ description: 'Статистика брендов' })
  brandMatches: BrandMatchStatsDto[];
}

export class ImportPreviewItemDto {
  @ApiProperty({ description: 'Номер строки' })
  row: number;

  @ApiProperty({ description: 'Артикул' })
  sku: string;

  @ApiProperty({ description: 'Название' })
  name: string;

  @ApiProperty({ description: 'Цена' })
  price: number;

  @ApiProperty({ description: 'Остаток' })
  stock: number;

  @ApiProperty({ description: 'Предполагаемая категория', required: false })
  suggestedCategory?: string;

  @ApiProperty({ description: 'Предполагаемый бренд', required: false })
  suggestedBrand?: string;

  @ApiProperty({
    description: 'Уровень уверенности в категории',
    required: false,
  })
  categoryConfidence?: number;

  @ApiProperty({ description: 'Уровень уверенности в бренде', required: false })
  brandConfidence?: number;
}

export class CategoryMatchStatsDto {
  @ApiProperty({ description: 'Название категории' })
  categoryName: string;

  @ApiProperty({ description: 'Количество товаров' })
  count: number;

  @ApiProperty({ description: 'Процент от общего количества' })
  percentage: number;
}

export class BrandMatchStatsDto {
  @ApiProperty({ description: 'Название бренда' })
  brandName: string;

  @ApiProperty({ description: 'Количество товаров' })
  count: number;

  @ApiProperty({ description: 'Процент от общего количества' })
  percentage: number;
}
