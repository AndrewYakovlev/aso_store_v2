import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';

export class CreateOrderStatusDto {
  @ApiProperty({ description: 'Код статуса (уникальный)' })
  @IsString()
  @Matches(/^[A-Z_]+$/, {
    message: 'Код должен содержать только заглавные буквы и подчеркивания',
  })
  code: string;

  @ApiProperty({ description: 'Название статуса' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Цвет статуса в HEX формате' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Цвет должен быть в HEX формате (#RRGGBB)',
  })
  color: string;

  @ApiProperty({
    description: 'Описание статуса',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Активен ли статус',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    required: false,
    description: 'Является ли финальным статусом',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean = false;

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
