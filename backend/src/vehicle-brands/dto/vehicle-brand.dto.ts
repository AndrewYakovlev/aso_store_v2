import { ApiProperty } from '@nestjs/swagger';

export class VehicleBrandDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameCyrillic: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty()
  popular: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}