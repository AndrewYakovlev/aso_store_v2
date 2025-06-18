import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP',
    example: '+71234567890',
  })
  @IsString()
  @IsPhoneNumber('RU')
  phone: string;
}

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Message about OTP sending',
    example: 'OTP code sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Time until new OTP can be requested (in seconds)',
    example: 60,
    required: false,
  })
  retryAfter?: number;

  @ApiProperty({
    description: 'OTP code (only in development mode)',
    example: '123456',
    required: false,
  })
  code?: string;
}
