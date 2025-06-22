import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserDto {
  @ApiProperty({ description: 'ID пользователя' })
  id: string;

  @ApiProperty({ description: 'Номер телефона' })
  phone: string;

  @ApiProperty({ description: 'Имя' })
  firstName: string;

  @ApiProperty({ required: false, description: 'Фамилия' })
  lastName?: string;

  @ApiProperty({ required: false, description: 'Отчество' })
  middleName?: string;

  @ApiProperty({ required: false, description: 'Email' })
  email?: string;

  @ApiProperty({ required: false, description: 'Название компании' })
  companyName?: string;

  @ApiProperty({ required: false, description: 'ИНН компании' })
  companyInn?: string;

  @ApiProperty({ enum: UserRole, description: 'Роль пользователя' })
  role: UserRole;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
