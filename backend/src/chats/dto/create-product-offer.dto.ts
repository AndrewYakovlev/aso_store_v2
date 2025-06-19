import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Expiry date of the offer' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}