import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ValidatePromoCodeResponseDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  eligibleAmount?: number;

  @ApiProperty({ required: false })
  discountAmount?: number;

  @ApiProperty({ required: false })
  discountType?: string;

  @ApiProperty({ required: false })
  discountValue?: number;
}
