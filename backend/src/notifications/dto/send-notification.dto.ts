import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';

class NotificationActionDto {
  @ApiProperty({ description: 'Action identifier' })
  @IsString()
  action: string;

  @ApiProperty({ description: 'Action title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Action icon', required: false })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'Notification icon URL', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Badge icon URL', required: false })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty({ description: 'Additional data', required: false })
  @IsObject()
  @IsOptional()
  data?: any;

  @ApiProperty({ description: 'Notification actions', required: false })
  @IsArray()
  @IsOptional()
  actions?: NotificationActionDto[];

  @ApiProperty({ description: 'Notification tag for grouping', required: false })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ description: 'Require user interaction', required: false })
  @IsBoolean()
  @IsOptional()
  requireInteraction?: boolean;
}