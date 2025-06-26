import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from './services/jwt.service';
import { AnonymousUserService } from './services/anonymous-user.service';
import { OtpService } from './services/otp.service';
import { JwtStrategy, AnonymousStrategy } from './strategies';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { CartModule } from '../cart/cart.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    forwardRef(() => FavoritesModule),
    forwardRef(() => CartModule),
    forwardRef(() => PromoCodesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtService,
    AnonymousUserService,
    OtpService,
    JwtStrategy,
    AnonymousStrategy,
    JwtAuthGuard,
    RolesGuard,
    OptionalAuthGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtService,
    JwtAuthGuard,
    RolesGuard,
    OptionalAuthGuard,
  ],
})
export class AuthModule {}
