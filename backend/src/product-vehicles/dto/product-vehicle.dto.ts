import { ApiProperty } from '@nestjs/swagger';
import { VehicleModelDto } from '../../vehicle-models/dto';

export class ProductVehicleDto {
  @ApiProperty({ description: 'ID связи товара с автомобилем' })
  id: string;

  @ApiProperty({ description: 'ID товара' })
  productId: string;

  @ApiProperty({ description: 'ID модели автомобиля' })
  vehicleModelId: string;

  @ApiProperty({ description: 'Начальный год (если не указан - с начала выпуска модели)', required: false })
  yearFrom?: number;

  @ApiProperty({ description: 'Конечный год (если не указан - до конца выпуска модели)', required: false })
  yearTo?: number;

  @ApiProperty({ description: 'Примечания по установке', required: false })
  fitmentNotes?: string;

  @ApiProperty({ description: 'Подходит для всех модификаций' })
  isUniversal: boolean;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;

  @ApiProperty({ description: 'Модель автомобиля', type: VehicleModelDto, required: false })
  vehicleModel?: VehicleModelDto;
}