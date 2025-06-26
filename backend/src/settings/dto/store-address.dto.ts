import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsJSON } from 'class-validator';

export class StoreAddressDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({
    description: 'Address type',
    enum: ['main', 'warehouse', 'pickup_point'],
  })
  type: string;

  @ApiPropertyOptional({ description: 'Address name' })
  name?: string;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'Street' })
  street: string;

  @ApiProperty({ description: 'Building number' })
  building: string;

  @ApiPropertyOptional({ description: 'Office/apartment number' })
  office?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'GPS coordinates as JSON' })
  coordinates?: string;

  @ApiPropertyOptional({ description: 'Working hours' })
  workingHours?: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateStoreAddressDto {
  @ApiPropertyOptional({
    description: 'Address type',
    enum: ['main', 'warehouse', 'pickup_point'],
    default: 'main',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Address name',
    example: 'Главный офис',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Country', default: 'Россия' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'City', example: 'Москва' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Street', example: 'ул. Ленина' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'Building number', example: '1' })
  @IsString()
  building: string;

  @ApiPropertyOptional({ description: 'Office/apartment number' })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'GPS coordinates as JSON',
    example: '{"lat": 55.7558, "lng": 37.6173}',
  })
  @IsOptional()
  @IsJSON()
  coordinates?: string;

  @ApiPropertyOptional({
    description: 'Working hours',
    example: 'Пн-Пт 9:00-18:00',
  })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStoreAddressDto {
  @ApiPropertyOptional({
    description: 'Address type',
    enum: ['main', 'warehouse', 'pickup_point'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Address name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'Building number' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ description: 'Office/apartment number' })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'GPS coordinates as JSON' })
  @IsOptional()
  @IsJSON()
  coordinates?: string;

  @ApiPropertyOptional({ description: 'Working hours' })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
