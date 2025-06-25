import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class AnonymousUserFilterDto extends PaginationDto {
  @ApiProperty({ required: false, description: 'Search by token' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    enum: ['createdAt', 'lastActivity'],
    default: 'lastActivity',
    description: 'Field to sort by' 
  })
  @IsOptional()
  @IsString()
  @IsEnum(['createdAt', 'lastActivity'])
  sortBy?: 'createdAt' | 'lastActivity' = 'lastActivity';

  @ApiProperty({ 
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort order'
  })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}