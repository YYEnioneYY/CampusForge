import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationProducerService } from '../notification-producer/notification-producer.service';
import { SendEmailVerificationInput } from './types/send-email-verification.input';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationProducerService: NotificationProducerService,
  ) {}

  async sendVerificationEmail(input: SendEmailVerificationInput): Promise<void> {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getExpiresAt();

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: input.userId,
        tokenHash,
        expiresAt,
      },
    });

    const verificationUrl = this.buildVerificationUrl(token);

    await this.notificationProducerService.sendEmailVerification({
      userId: input.userId,
      email: input.email,
      verificationUrl,
      name: input.name,
    });
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    const secret = this.configService.getOrThrow<string>(
      'EMAIL_VERIFICATION_TOKEN_HASH_SECRET',
    );

    return createHmac('sha256', secret).update(token).digest('hex');
  }

  private buildVerificationUrl(token: string): string {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    const url = new URL('/verify-email', frontendUrl);
    url.searchParams.set('token', token);

    return url.toString();
  }

  private getExpiresAt(): Date {
    const expiresIn = this.configService.get<string>(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
      '1d',
    );

    return this.expiresInToDate(expiresIn);
  }

  private expiresInToDate(value: string): Date {
    const normalizedValue = value.trim();

    const match = normalizedValue.match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
      throw new Error(
        'Invalid email verification expiration format. Use values like 15m, 1h, 1d',
      );
    }

    const amount = Number(match[1]);
    const unit = match[2];

    const multiplierMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * multiplierMap[unit]);
  }
}