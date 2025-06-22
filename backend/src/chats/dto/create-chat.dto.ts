import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional({ description: 'Initial message to start the chat' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Product ID if the chat is about a specific product',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;
}
