import { Module, forwardRef } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodeTriggersService } from './promo-code-triggers.service';
import { PromoCodeValidationService } from './promo-code-validation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CartModule), NotificationsModule],
  controllers: [PromoCodesController],
  providers: [
    PromoCodesService,
    PromoCodeTriggersService,
    PromoCodeValidationService,
  ],
  exports: [
    PromoCodesService,
    PromoCodeTriggersService,
    PromoCodeValidationService,
  ],
})
export class PromoCodesModule {}
