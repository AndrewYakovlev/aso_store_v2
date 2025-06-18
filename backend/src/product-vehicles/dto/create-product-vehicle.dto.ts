import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateProductVehicleDto {
  @ApiProperty({ description: 'ID модели автомобиля' })
  @IsString()
  vehicleModelId: string;

  @ApiProperty({
    description: 'Начальный год (если не указан - с начала выпуска модели)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFrom?: number;

  @ApiProperty({
    description: 'Конечный год (если не указан - до конца выпуска модели)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearTo?: number;

  @ApiProperty({ description: 'Примечания по установке', required: false })
  @IsOptional()
  @IsString()
  fitmentNotes?: string;

  @ApiProperty({ description: 'Подходит для всех модификаций', default: false })
  @IsOptional()
  @IsBoolean()
  isUniversal?: boolean;
}
