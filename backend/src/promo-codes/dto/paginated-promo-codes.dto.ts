import { ApiProperty } from '@nestjs/swagger';
import { PromoCodeDto } from './promo-code.dto';

export class PaginatedPromoCodesDto {
  @ApiProperty({ type: [PromoCodeDto] })
  items: PromoCodeDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
