import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateDeliveryMethodDto {
  @ApiProperty({ description: 'Уникальный код метода доставки' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Название метода доставки' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание метода' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Базовая стоимость доставки' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    required: false,
    description: 'Активен ли метод',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    required: false,
    description: 'Порядок сортировки',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number = 0;
}
