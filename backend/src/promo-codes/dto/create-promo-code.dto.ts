import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  Min, 
  Max,
  IsDateString,
  Matches,
} from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreatePromoCodeDto {
  @ApiProperty({ description: 'Promo code (will be uppercased)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]+$/i, { message: 'Code must contain only letters and numbers' })
  code: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value (amount or percentage)' })
  @IsNumber()
  @Min(0)
  @Max(999999)
  discountValue: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxUsesTotal?: number;

  @ApiProperty({ default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  firstOrderOnly?: boolean;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}