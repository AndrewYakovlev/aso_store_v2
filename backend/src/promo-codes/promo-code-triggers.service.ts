import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodeTriggerDto } from './dto/promo-code-trigger.dto';
import { UpdatePromoCodeTriggerDto } from './dto/update-promo-code-trigger.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PromoCodeTriggersService {
  private readonly logger = new Logger(PromoCodeTriggersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly promoCodesService: PromoCodesService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async getActiveTriggers(): Promise<PromoCodeTriggerDto[]> {
    const now = new Date();
    
    const triggers = await this.prisma.promoCodeTrigger.findMany({
      where: {
        isActive: true,
        activeFrom: { lte: now },
        OR: [{ activeUntil: null }, { activeUntil: { gte: now } }],
      },
    });

    return triggers.map((trigger) => this.formatTriggerDto(trigger));
  }

  async getTriggerByType(type: string): Promise<PromoCodeTriggerDto | null> {
    const trigger = await this.prisma.promoCodeTrigger.findUnique({
      where: { triggerType: type },
    });

    return trigger ? this.formatTriggerDto(trigger) : null;
  }

  async updateTrigger(
    type: string,
    dto: UpdatePromoCodeTriggerDto,
  ): Promise<PromoCodeTriggerDto> {
    let trigger = await this.prisma.promoCodeTrigger.findUnique({
      where: { triggerType: type },
    });

    if (!trigger) {
      // Create new trigger if doesn't exist
      trigger = await this.prisma.promoCodeTrigger.create({
        data: {
          triggerType: type,
          isActive: dto.isActive ?? true,
          discountType: dto.discountType!,
          discountValue: new Decimal(dto.discountValue!),
          minOrderAmount: dto.minOrderAmount
            ? new Decimal(dto.minOrderAmount)
            : null,
          firstOrderOnly: dto.firstOrderOnly ?? false,
          validityDays: dto.validityDays!,
          activeFrom: dto.activeFrom ? new Date(dto.activeFrom) : new Date(),
          activeUntil: dto.activeUntil ? new Date(dto.activeUntil) : null,
        },
      });
    } else {
      // Update existing trigger
      trigger = await this.prisma.promoCodeTrigger.update({
        where: { triggerType: type },
        data: {
          ...dto,
          discountValue: dto.discountValue
            ? new Decimal(dto.discountValue)
            : undefined,
          minOrderAmount: dto.minOrderAmount !== undefined
            ? dto.minOrderAmount ? new Decimal(dto.minOrderAmount) : null
            : undefined,
        },
      });
    }

    return this.formatTriggerDto(trigger);
  }

  async handleRegistration(userId: string): Promise<void> {
    const now = new Date();
    
    // Get active registration trigger
    const trigger = await this.prisma.promoCodeTrigger.findFirst({
      where: {
        triggerType: 'registration',
        isActive: true,
        activeFrom: { lte: now },
        OR: [{ activeUntil: null }, { activeUntil: { gte: now } }],
      },
    });

    if (!trigger) {
      this.logger.log('No active registration trigger found');
      return;
    }

    // Generate unique promo code
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.promoCodesService.generateUniqueCode('REG');
      const exists = await this.prisma.promoCode.findUnique({
        where: { code },
      });

      if (!exists) {
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      this.logger.error('Failed to generate unique promo code after 10 attempts');
      return;
    }

    // Calculate validity period
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + trigger.validityDays);

    // Create promo code
    const promoCode = await this.prisma.promoCode.create({
      data: {
        code,
        description: 'Промокод за регистрацию',
        discountType: trigger.discountType,
        discountValue: trigger.discountValue,
        minOrderAmount: trigger.minOrderAmount,
        maxUsesTotal: 1,
        maxUsesPerUser: 1,
        firstOrderOnly: trigger.firstOrderOnly,
        validFrom: now,
        validUntil,
        isPublic: false,
        isActive: true,
        createdByTrigger: 'registration',
      },
    });

    // Assign to user
    await this.prisma.userPromoCode.create({
      data: {
        userId,
        promoCodeId: promoCode.id,
      },
    });

    this.logger.log(`Created registration promo code ${code} for user ${userId}`);

    // Send push notification about new promo code
    try {
      const discountText = trigger.discountType === 'PERCENTAGE' 
        ? `${trigger.discountValue}%` 
        : `${trigger.discountValue} ₽`;
      
      await this.notificationsService.sendNotificationToUser(userId, undefined, {
        title: 'Подарок за регистрацию! 🎁',
        body: `Вы получили промокод ${code} на скидку ${discountText}. Действует ${trigger.validityDays} дней!`,
        icon: '/icon-192x192.png',
        tag: 'promo-code',
        data: {
          type: 'promo-code',
          promoCode: code,
          url: '/account/promo-codes',
        },
        actions: [
          {
            action: 'view',
            title: 'Посмотреть',
          },
          {
            action: 'copy',
            title: 'Скопировать код',
          },
        ],
      });
    } catch (error) {
      this.logger.error('Failed to send promo code notification:', error);
    }
  }

  private formatTriggerDto(trigger: any): PromoCodeTriggerDto {
    return {
      id: trigger.id,
      triggerType: trigger.triggerType,
      isActive: trigger.isActive,
      discountType: trigger.discountType,
      discountValue: trigger.discountValue.toNumber(),
      minOrderAmount: trigger.minOrderAmount?.toNumber() || null,
      firstOrderOnly: trigger.firstOrderOnly,
      validityDays: trigger.validityDays,
      activeFrom: trigger.activeFrom.toISOString(),
      activeUntil: trigger.activeUntil?.toISOString() || null,
      createdAt: trigger.createdAt.toISOString(),
      updatedAt: trigger.updatedAt.toISOString(),
    };
  }
}