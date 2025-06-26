import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { DiscountType } from '@prisma/client';

export class UpdatePromoCodeTriggerDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ enum: DiscountType, required: false })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(999999)
  discountValue?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  firstOrderOnly?: boolean;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(365)
  validityDays?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  activeFrom?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  activeUntil?: string;
}
