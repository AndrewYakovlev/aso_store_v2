import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsString,
  IsIn,
} from 'class-validator';

export class OrdersFilterDto {
  @ApiProperty({ description: 'ID статуса заказа', required: false })
  @IsUUID()
  @IsOptional()
  statusId?: string;

  @ApiProperty({ description: 'Поиск по номеру заказа', required: false })
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @ApiProperty({ description: 'Страница', required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Количество на странице',
    required: false,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: 'Поле для сортировки',
    required: false,
    default: 'createdAt',
    enum: ['createdAt', 'orderNumber', 'totalAmount'],
  })
  @IsString()
  @IsIn(['createdAt', 'orderNumber', 'totalAmount'])
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Порядок сортировки',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
