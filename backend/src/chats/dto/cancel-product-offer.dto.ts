import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelProductOfferDto {
  @ApiProperty({ description: 'ID of the product offer to cancel' })
  @IsNotEmpty()
  @IsString()
  offerId: string;
}