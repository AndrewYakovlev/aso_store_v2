import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateVehicleModelDto {
  @ApiProperty()
  @IsString()
  externalId: string;

  @ApiProperty()
  @IsUUID()
  brandId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  nameCyrillic: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase letters, numbers and hyphens only',
  })
  slug: string;

  @ApiProperty({ description: 'Класс автомобиля (A, B, C, D, E, S и т.д.)' })
  @IsString()
  @Matches(/^[A-Z]$/, {
    message: 'Class must be a single uppercase letter',
  })
  class: string;

  @ApiProperty({ description: 'Год начала производства' })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  yearFrom: number;

  @ApiProperty({ description: 'Год окончания производства', required: false })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  yearTo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
