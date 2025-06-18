import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsOptional, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number',
    example: '+71234567890',
  })
  @IsString()
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({
    description: 'OTP code',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiPropertyOptional({
    description: 'Anonymous user token to merge with authenticated user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  anonymousToken?: string;
}

export class AuthTokensDto {
  @ApiProperty({
    description: 'Access token for API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for getting new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  };
}
