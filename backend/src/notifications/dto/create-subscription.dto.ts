import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

class PushSubscriptionKeysDto {
  @ApiProperty({ description: 'p256dh key for encryption' })
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @ApiProperty({ description: 'auth secret' })
  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Push subscription endpoint' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiProperty({ description: 'Encryption keys' })
  @IsObject()
  keys: PushSubscriptionKeysDto;

  @ApiProperty({ description: 'User agent string', required: false })
  @IsString()
  @IsOptional()
  userAgent?: string;
}