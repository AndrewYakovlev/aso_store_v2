import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  type: 'user' | 'anonymous';
  phone?: string;
}

export interface AnonymousJwtPayload {
  sub: string;
  type: 'anonymous';
}

export interface UserJwtPayload {
  sub: string;
  type: 'user';
  phone: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateUserTokens(userId: string, phone: string) {
    const payload: UserJwtPayload = {
      sub: userId,
      type: 'user',
      phone,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'default-access-secret',
        ),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'default-refresh-secret',
        ),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async generateAnonymousToken(anonymousUserId: string) {
    const payload: AnonymousJwtPayload = {
      sub: anonymousUserId,
      type: 'anonymous',
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_ANONYMOUS_SECRET',
        'default-anonymous-secret',
      ),
      expiresIn: '365d',
    });

    return token;
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(
        'JWT_ACCESS_SECRET',
        'default-access-secret',
      ),
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'default-refresh-secret',
      ),
    });
  }

  async verifyAnonymousToken(token: string): Promise<AnonymousJwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(
        'JWT_ANONYMOUS_SECRET',
        'default-anonymous-secret',
      ),
    });
  }
}
