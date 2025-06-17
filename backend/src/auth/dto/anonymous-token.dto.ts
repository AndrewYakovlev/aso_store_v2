import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AnonymousTokenResponseDto {
  @ApiProperty({
    description: 'Anonymous user token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Anonymous user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  anonymousUserId: string;
}

export class ValidateAnonymousTokenDto {
  @ApiProperty({
    description: 'Anonymous token to validate',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}