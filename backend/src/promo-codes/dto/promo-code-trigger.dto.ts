import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class PromoCodeTriggerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  triggerType: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty({ required: false })
  minOrderAmount?: number | null;

  @ApiProperty()
  firstOrderOnly: boolean;

  @ApiProperty()
  validityDays: number;

  @ApiProperty()
  activeFrom: string;

  @ApiProperty({ required: false })
  activeUntil?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}