import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+71234567890',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'Иван',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Иванов',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Иванович',
  })
  middleName?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'ООО "Рога и копыта"',
  })
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Company INN',
    example: '1234567890',
  })
  companyInn?: string;

  @ApiPropertyOptional({
    description: 'Default shipping address',
    example: 'г. Москва, ул. Ленина, д. 1',
  })
  defaultShippingAddress?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Is phone verified',
    example: true,
  })
  isPhoneVerified: boolean;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
