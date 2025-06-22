import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Уникальный код метода оплаты' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Название метода оплаты' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание метода' })
  @IsString()
  description: string;

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
