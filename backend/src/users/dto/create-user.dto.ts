import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Номер телефона' })
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({ description: 'Имя' })
  @IsString()
  firstName: string;

  @ApiProperty({ required: false, description: 'Фамилия' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, description: 'Отчество' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ required: false, description: 'Email' })
  @IsOptional()
  @IsEmail({}, { message: 'Email должен быть корректным' })
  email?: string;

  @ApiProperty({ required: false, description: 'Название компании' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ required: false, description: 'ИНН компании' })
  @IsOptional()
  @IsString()
  companyInn?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Роль пользователя',
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  role: UserRole = UserRole.CUSTOMER;
}
