import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromoCodeValidationService } from './promo-code-validation.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodeDto } from './dto/promo-code.dto';
import { PromoCodeUsageDto } from './dto/promo-code-usage.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { DiscountType } from '@prisma/client';

@Injectable()
export class PromoCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: PromoCodeValidationService,
  ) {}

  async create(dto: CreatePromoCodeDto): Promise<PromoCodeDto> {
    // Validate code uniqueness
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Promo code already exists');
    }

    const promoCode = await this.prisma.promoCode.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        discountValue: new Decimal(dto.discountValue),
        minOrderAmount: dto.minOrderAmount
          ? new Decimal(dto.minOrderAmount)
          : null,
      },
    });

    return this.formatPromoCodeDto(promoCode);
  }

  async findAll(filters?: {
    isActive?: boolean;
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: PromoCodeDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [promoCodes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        include: {
          _count: {
            select: { usages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.promoCode.count({ where }),
    ]);

    return {
      items: promoCodes.map((code) => this.formatPromoCodeDto(code)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PromoCodeDto> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true, userPromoCodes: true },
        },
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return this.formatPromoCodeDto(promoCode);
  }

  async findByCode(code: string): Promise<PromoCodeDto | null> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return promoCode ? this.formatPromoCodeDto(promoCode) : null;
  }

  async update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCodeDto> {
    const existing = await this.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Promo code not found');
    }

    // Check if code is being changed and validate uniqueness
    if (dto.code && dto.code.toUpperCase() !== existing.code) {
      const codeExists = await this.prisma.promoCode.findUnique({
        where: { code: dto.code.toUpperCase() },
      });

      if (codeExists) {
        throw new BadRequestException('Promo code already exists');
      }
    }

    const updated = await this.prisma.promoCode.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code?.toUpperCase(),
        discountValue: dto.discountValue
          ? new Decimal(dto.discountValue)
          : undefined,
        minOrderAmount:
          dto.minOrderAmount !== undefined
            ? dto.minOrderAmount
              ? new Decimal(dto.minOrderAmount)
              : null
            : undefined,
      },
    });

    return this.formatPromoCodeDto(updated);
  }

  async delete(id: string): Promise<void> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    if (promoCode._count.usages > 0) {
      throw new BadRequestException(
        'Cannot delete promo code that has been used',
      );
    }

    await this.prisma.promoCode.delete({ where: { id } });
  }

  async getUsageStatistics(promoCodeId: string): Promise<PromoCodeUsageDto[]> {
    const usages = await this.prisma.promoCodeUsage.findMany({
      where: { promoCodeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return usages.map((usage) => this.formatUsageDto(usage));
  }

  async getUserPromoCodes(userId: string): Promise<PromoCodeDto[]> {
    const now = new Date();

    // Get personal promo codes
    const personalCodes = await this.prisma.userPromoCode.findMany({
      where: { userId },
      include: {
        promoCode: {
          include: {
            _count: {
              select: { usages: true },
            },
          },
        },
      },
    });

    // Get public promo codes
    const publicCodes = await this.prisma.promoCode.findMany({
      where: {
        isPublic: true,
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    // Combine and filter out used ones
    const allCodes = [
      ...personalCodes.map((pc) => pc.promoCode),
      ...publicCodes,
    ];

    // Check usage for each code
    const availableCodes: any[] = [];
    for (const code of allCodes) {
      const userUsageCount = await this.prisma.promoCodeUsage.count({
        where: {
          promoCodeId: code.id,
          userId,
        },
      });

      if (userUsageCount < code.maxUsesPerUser) {
        availableCodes.push(code);
      }
    }

    return availableCodes.map((code) => this.formatPromoCodeDto(code));
  }

  async assignToUser(promoCodeId: string, userId: string): Promise<void> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    if (promoCode.isPublic) {
      throw new BadRequestException('Cannot assign public promo code to user');
    }

    // Check if already assigned
    const existing = await this.prisma.userPromoCode.findUnique({
      where: {
        userId_promoCodeId: {
          userId,
          promoCodeId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Promo code already assigned to user');
    }

    await this.prisma.userPromoCode.create({
      data: {
        userId,
        promoCodeId,
      },
    });
  }

  generateUniqueCode(prefix?: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let code = prefix || '';

    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  }

  async createUsageRecord(
    promoCodeId: string,
    orderId: string,
    userId: string,
    discountAmount: number,
    orderAmount?: number,
  ): Promise<void> {
    await this.prisma.promoCodeUsage.create({
      data: {
        promoCodeId,
        orderId,
        userId,
        orderAmount: new Decimal(orderAmount || 0),
        discountAmount: new Decimal(discountAmount),
      },
    });
  }

  async getAllUsageHistory(filters: {
    promoCodeId?: string;
    userId?: string;
    orderId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: PromoCodeUsageDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.promoCodeId) {
      where.promoCodeId = filters.promoCodeId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [usages, total] = await Promise.all([
      this.prisma.promoCodeUsage.findMany({
        where,
        include: {
          promoCode: true,
          user: true,
          order: {
            include: {
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.promoCodeUsage.count({ where }),
    ]);

    const items: any[] = usages.map((usage) => ({
      id: usage.id,
      promoCodeId: usage.promoCodeId,
      promoCode: {
        code: usage.promoCode.code,
        description: usage.promoCode.description,
        discountType: usage.promoCode.discountType,
        discountValue: usage.promoCode.discountValue.toNumber(),
      },
      userId: usage.userId,
      user: usage.user
        ? {
            id: usage.user.id,
            phone: usage.user.phone,
            firstName: usage.user.firstName,
            lastName: usage.user.lastName,
          }
        : null,
      orderId: usage.orderId,
      order: {
        id: usage.order.id,
        orderNumber: usage.order.orderNumber,
        totalAmount: usage.order.totalAmount.toNumber(),
        createdAt: usage.order.createdAt.toISOString(),
        status: usage.order.status?.name || 'Unknown',
      },
      orderAmount: usage.orderAmount?.toNumber() || 0,
      discountAmount: usage.discountAmount.toNumber(),
      createdAt: usage.createdAt.toISOString(),
      usedAt: usage.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async calculateDiscount(
    promoCode: PromoCodeDto,
    eligibleAmount: number,
  ): Promise<number> {
    if (promoCode.discountType === DiscountType.FIXED_AMOUNT) {
      // Fixed amount discount
      const discount = Math.min(promoCode.discountValue, eligibleAmount);
      return Math.max(0, discount);
    } else {
      // Percentage discount
      const discount = (eligibleAmount * promoCode.discountValue) / 100;
      return Math.max(0, discount);
    }
  }

  private formatPromoCodeDto(promoCode: any): PromoCodeDto {
    return {
      id: promoCode.id,
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue.toNumber(),
      minOrderAmount: promoCode.minOrderAmount?.toNumber() || null,
      maxUsesTotal: promoCode.maxUsesTotal,
      maxUsesPerUser: promoCode.maxUsesPerUser,
      firstOrderOnly: promoCode.firstOrderOnly,
      validFrom: promoCode.validFrom.toISOString(),
      validUntil: promoCode.validUntil?.toISOString() || null,
      isPublic: promoCode.isPublic,
      isActive: promoCode.isActive,
      createdByTrigger: promoCode.createdByTrigger,
      usageCount: promoCode._count?.usages || 0,
      createdAt: promoCode.createdAt.toISOString(),
      updatedAt: promoCode.updatedAt.toISOString(),
    };
  }

  private formatUsageDto(usage: any): PromoCodeUsageDto {
    return {
      id: usage.id,
      promoCodeId: usage.promoCodeId,
      orderId: usage.orderId,
      userId: usage.userId,
      discountAmount: usage.discountAmount.toNumber(),
      orderAmount: usage.orderAmount.toNumber(),
      createdAt: usage.createdAt.toISOString(),
      user: usage.user
        ? {
            id: usage.user.id,
            firstName: usage.user.firstName,
            lastName: usage.user.lastName,
            phone: usage.user.phone,
          }
        : null,
      order: {
        id: usage.order.id,
        orderNumber: usage.order.orderNumber,
        totalAmount: usage.order.totalAmount.toNumber(),
        createdAt: usage.order.createdAt.toISOString(),
      },
    };
  }
}
