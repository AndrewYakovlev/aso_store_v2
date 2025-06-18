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
import { PrismaModule } from '../prisma/prisma.module';
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    forwardRef(() => FavoritesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
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
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
