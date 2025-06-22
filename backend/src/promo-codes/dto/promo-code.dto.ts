import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class PromoCodeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty({ required: false })
  minOrderAmount?: number | null;

  @ApiProperty({ required: false })
  maxUsesTotal?: number | null;

  @ApiProperty()
  maxUsesPerUser: number;

  @ApiProperty()
  firstOrderOnly: boolean;

  @ApiProperty()
  validFrom: string;

  @ApiProperty({ required: false })
  validUntil?: string | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  createdByTrigger?: string | null;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}