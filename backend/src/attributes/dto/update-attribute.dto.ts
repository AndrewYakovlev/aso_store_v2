import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAttributeDto } from './create-attribute.dto';

export class UpdateAttributeDto extends PartialType(
  OmitType(CreateAttributeDto, ['code'] as const),
) {}
