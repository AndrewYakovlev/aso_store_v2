import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateProductOfferDto {
  @ApiPropertyOptional({ description: 'Name of the product offer' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the product offer' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Price of the product offer',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Old price (before discount)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  oldPrice?: number;

  @ApiPropertyOptional({
    description: 'Array of image URLs of the product',
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Delivery time in days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryDays?: number;

  @ApiPropertyOptional({ description: 'Is this an original product' })
  @IsOptional()
  @IsBoolean()
  isOriginal?: boolean;

  @ApiPropertyOptional({ description: 'Is this an analog product' })
  @IsOptional()
  @IsBoolean()
  @ValidateIf((o: UpdateProductOfferDto) => o.isOriginal !== true)
  isAnalog?: boolean;

  @ApiPropertyOptional({ description: 'Is the offer active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Expiry date of the offer' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
