import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpCode } from '@prisma/client';

@Injectable()
export class OtpService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly CODE_LENGTH = 6;
  private readonly EXPIRY_MINUTES = 5;

  constructor(private prisma: PrismaService) {}

  async createOtp(userId: string): Promise<string> {
    // Invalidate previous codes for this user
    await this.prisma.otpCode.updateMany({
      where: {
        userId,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        verified: true,
      },
    });

    // Generate new 6-digit code
    const code = this.generateCode();

    // Create OTP record
    await this.prisma.otpCode.create({
      data: {
        userId,
        code,
        expiresAt: new Date(Date.now() + this.EXPIRY_MINUTES * 60 * 1000),
        attempts: 0,
      },
    });

    return code;
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const otpCode = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpCode) {
      // Increment attempts for the latest OTP
      const latestOtp = await this.prisma.otpCode.findFirst({
        where: {
          userId,
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (latestOtp) {
        await this.prisma.otpCode.update({
          where: { id: latestOtp.id },
          data: { attempts: { increment: 1 } },
        });

        if (latestOtp.attempts + 1 >= this.MAX_ATTEMPTS) {
          throw new ConflictException(
            'Too many failed attempts. Please request a new code.',
          );
        }
      }

      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Mark code as verified
    await this.prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { verified: true },
    });

    return true;
  }

  async getLatestOtp(userId: string): Promise<OtpCode | null> {
    return this.prisma.otpCode.findFirst({
      where: {
        userId,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateCode(): string {
    const min = Math.pow(10, this.CODE_LENGTH - 1);
    const max = Math.pow(10, this.CODE_LENGTH) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}
