import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class StoreSettingDto {
  @ApiProperty({ description: 'Setting key' })
  key: string;

  @ApiProperty({ description: 'Setting value as JSON' })
  value: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UpdateSettingDto {
  @ApiProperty({ description: 'Setting key' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Setting value (can be any JSON-serializable value)' })
  value: any;
}