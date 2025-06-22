import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeUsageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  promoCodeId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty({ required: false })
  userId?: string | null;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  orderAmount: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone: string;
  } | null;

  @ApiProperty()
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
  };
}