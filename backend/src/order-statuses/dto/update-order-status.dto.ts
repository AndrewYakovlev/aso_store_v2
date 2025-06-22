import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrderStatusDto } from './create-order-status.dto';

export class UpdateOrderStatusDto extends PartialType(
  OmitType(CreateOrderStatusDto, ['code'] as const),
) {}
