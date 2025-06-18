import { ApiProperty } from '@nestjs/swagger';
import { BrandWithCountDto } from './brand-with-count.dto';

export class PaginatedBrandsDto {
  @ApiProperty({ type: [BrandWithCountDto] })
  items: BrandWithCountDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
