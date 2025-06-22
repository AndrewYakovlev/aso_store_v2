import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    required: false,
    description: 'Имя пользователя',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiProperty({
    required: false,
    description: 'Фамилия пользователя',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiProperty({
    required: false,
    description: 'Email пользователя',
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.email !== '' && o.email !== null && o.email !== undefined,
  )
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @ApiProperty({
    required: false,
    description: 'Название компании (для B2B клиентов)',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    required: false,
    description: 'ИНН компании (для B2B клиентов)',
  })
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.companyInn !== '' &&
      o.companyInn !== null &&
      o.companyInn !== undefined,
  )
  @IsString()
  companyInn?: string;

  @ApiProperty({
    required: false,
    description: 'Адрес доставки по умолчанию',
  })
  @IsOptional()
  @IsString()
  defaultShippingAddress?: string;
}
