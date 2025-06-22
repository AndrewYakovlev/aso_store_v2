import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { UserRole } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class UserFilterDto extends PaginationDto {
  @ApiProperty({
    required: false,
    description: 'Поиск по имени, телефону или email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: UserRole,
    description: 'Фильтр по роли',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    required: false,
    description: 'Фильтр по дате регистрации (от)',
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Фильтр по дате регистрации (до)',
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
