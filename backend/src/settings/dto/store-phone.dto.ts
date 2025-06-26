import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';

export class StorePhoneDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiPropertyOptional({ description: 'Phone name/department' })
  name?: string;

  @ApiProperty({ description: 'Is available on WhatsApp' })
  isWhatsApp: boolean;

  @ApiProperty({ description: 'Is available on Telegram' })
  isTelegram: boolean;

  @ApiProperty({ description: 'Is main phone number' })
  isMain: boolean;

  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateStorePhoneDto {
  @ApiProperty({ description: 'Phone number in format +7XXXXXXXXXX' })
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Phone must be in format +7XXXXXXXXXX',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Phone name/department',
    example: 'Отдел продаж',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Is available on WhatsApp',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isWhatsApp?: boolean;

  @ApiPropertyOptional({
    description: 'Is available on Telegram',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTelegram?: boolean;

  @ApiPropertyOptional({
    description: 'Is main phone number',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStorePhoneDto {
  @ApiPropertyOptional({ description: 'Phone number in format +7XXXXXXXXXX' })
  @IsOptional()
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Phone must be in format +7XXXXXXXXXX',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'Phone name/department' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Is available on WhatsApp' })
  @IsOptional()
  @IsBoolean()
  isWhatsApp?: boolean;

  @ApiPropertyOptional({ description: 'Is available on Telegram' })
  @IsOptional()
  @IsBoolean()
  isTelegram?: boolean;

  @ApiPropertyOptional({ description: 'Is main phone number' })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
