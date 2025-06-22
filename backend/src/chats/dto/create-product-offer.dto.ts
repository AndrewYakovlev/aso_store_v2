import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductOfferDto {
  @ApiProperty({ description: 'Name of the product offer' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the product offer' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Price of the product offer', minimum: 0 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Old price (before discount)', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  oldPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Image URL of the product (deprecated, use images instead)'
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ 
    description: 'Array of image URLs of the product',
    type: [String]
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
  @ValidateIf((o) => o.isOriginal !== true) // Can't be both original and analog
  isAnalog?: boolean;

  @ApiPropertyOptional({ description: 'Expiry date of the offer' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
