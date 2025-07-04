import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { JwtService } from './services/jwt.service';
import { AnonymousUserService } from './services/anonymous-user.service';
import { OtpService } from './services/otp.service';
import { FavoritesService } from '../favorites/favorites.service';
import { CartService } from '../cart/cart.service';
import { PromoCodeTriggersService } from '../promo-codes/promo-code-triggers.service';
import { AuthTokensDto, UserProfileDto, UpdateProfileDto } from './dto';
import {
  normalizePhone,
  formatPhoneForDisplay,
} from '../common/utils/phone.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly anonymousUserService: AnonymousUserService,
    private readonly otpService: OtpService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
    @Inject(forwardRef(() => PromoCodeTriggersService))
    private readonly promoCodesTriggersService: PromoCodeTriggersService,
  ) {}

  async getAnonymousToken() {
    const { user, token } =
      await this.anonymousUserService.createAnonymousUser();
    return {
      token,
      anonymousUserId: user.id,
    };
  }

  async validateAnonymousToken(token: string) {
    const user = await this.anonymousUserService.findByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid anonymous token');
    }
    return { valid: true, anonymousUserId: user.id };
  }

  async sendOtp(phone: string) {
    // Нормализуем номер телефона
    const normalizedPhone = normalizePhone(phone);

    // Find or create user by phone
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone: normalizedPhone },
      });
    }

    // Create OTP code
    const code = await this.otpService.createOtp(user.id);

    // In development, return code for testing
    // In production, send SMS
    console.log(`OTP code for ${normalizedPhone}: ${code}`);

    return {
      message: 'OTP code sent successfully',
      retryAfter: 60, // 60 seconds until next code can be requested
      // In dev mode, return code for testing
      ...(process.env.NODE_ENV === 'development' && { code }),
    };
  }

  async verifyOtp(
    phone: string,
    code: string,
    anonymousToken?: string,
  ): Promise<AuthTokensDto> {
    // Нормализуем номер телефона
    const normalizedPhone = normalizePhone(phone);

    // Find user by phone
    const user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify OTP code
    await this.otpService.verifyOtp(user.id, code);

    // Check if this is first verification (registration)
    const isFirstVerification = !user.isPhoneVerified;

    // If anonymous token provided, merge data
    if (anonymousToken) {
      const anonymousUser =
        await this.anonymousUserService.findByToken(anonymousToken);
      if (anonymousUser && !anonymousUser.userId) {
        // Merge favorites
        await this.favoritesService.mergeFavorites(anonymousUser.id, user.id);
        // Merge cart
        await this.cartService.mergeCarts(anonymousUser.id, user.id);
        // Merge anonymous user data
        await this.anonymousUserService.mergeWithUser(
          anonymousUser.id,
          user.id,
        );
      }
    }

    // Mark phone as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    // Handle registration trigger if this is first verification
    if (isFirstVerification) {
      try {
        await this.promoCodesTriggersService.handleRegistration(user.id);
      } catch (error) {
        // Log error but don't fail the registration
        console.error('Failed to handle registration trigger:', error);
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } =
      await this.jwtService.generateUserTokens(user.id, user.phone);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: formatPhoneForDisplay(user.phone),
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        middleName: user.middleName || undefined,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokensDto> {
    try {
      const payload = await this.jwtService.verifyRefreshToken(refreshToken);

      if (payload.type !== 'user') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.jwtService.generateUserTokens(
        user.id,
        user.phone,
      );

      return {
        ...tokens,
        user: {
          id: user.id,
          phone: formatPhoneForDisplay(user.phone),
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          middleName: user.middleName || undefined,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      phone: formatPhoneForDisplay(user.phone),
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      middleName: user.middleName || undefined,
      email: user.email || undefined,
      companyName: user.companyName || undefined,
      companyInn: user.companyInn || undefined,
      defaultShippingAddress: user.defaultShippingAddress || undefined,
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    // Подготавливаем данные для обновления
    const updateData: Prisma.UserUpdateInput = {};

    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email || null; // Сохраняем null если пустая строка
    }
    if (dto.companyName !== undefined) {
      updateData.companyName = dto.companyName;
    }
    if (dto.companyInn !== undefined) {
      updateData.companyInn = dto.companyInn;
    }
    if (dto.defaultShippingAddress !== undefined) {
      updateData.defaultShippingAddress = dto.defaultShippingAddress;
    }

    // Обновляем пользователя
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Возвращаем обновленный профиль
    return {
      id: user.id,
      phone: formatPhoneForDisplay(user.phone),
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      email: user.email || undefined,
      companyName: user.companyName || undefined,
      companyInn: user.companyInn || undefined,
      defaultShippingAddress: user.defaultShippingAddress || undefined,
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
    };
  }
}
