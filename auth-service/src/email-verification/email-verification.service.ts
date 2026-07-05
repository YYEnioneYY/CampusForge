import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationProducerService } from '../notification-producer/notification-producer.service';
import { SendEmailVerificationInput } from './types/send-email-verification.input';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { UsersService } from '../users/users.service';

type CreateVerificationTokenOptions = {
  enforceCooldown?: boolean;
};

type CreateVerificationTokenResult = {
  verificationUrl: string;
  expiresAt: Date;
};

type SendVerificationEmailEventInput = {
  userId: string;
  email: string;
  verificationUrl: string;
  name?: string;
};

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationProducerService: NotificationProducerService,
    private readonly usersService: UsersService,
  ) {}

  async sendVerificationEmail(input: SendEmailVerificationInput): Promise<void> {
    const { verificationUrl } = await this.createVerificationToken(input.userId);
  
    await this.sendVerificationEmailEvent({
      userId: input.userId,
      email: input.email,
      verificationUrl,
      name: input.name,
    });
  }

  async createVerificationToken(
    userId: string,
    options: CreateVerificationTokenOptions = {},
  ): Promise<CreateVerificationTokenResult> {
    const now = new Date();
  
    if (options.enforceCooldown) {
      await this.assertCanResend(userId, now);
    }
  
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getExpiresAt();
  
    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: {
          userId,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });
  
      await tx.emailVerificationToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
    });
  
    return {
      verificationUrl: this.buildVerificationUrl(token),
      expiresAt,
    };
  }

  async sendVerificationEmailEvent(
    input: SendVerificationEmailEventInput,
  ): Promise<void> {
    await this.notificationProducerService.sendEmailVerification({
      userId: input.userId,
      email: input.email,
      verificationUrl: input.verificationUrl,
      name: input.name,
    });
  }

  private async assertCanResend(userId: string, now: Date): Promise<void> {
    const cooldownMs = this.getResendCooldownMs();
  
    if (cooldownMs === 0) {
      return;
    }
  
    const lastToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });
  
    if (!lastToken) {
      return;
    }
  
    const elapsedMs = now.getTime() - lastToken.createdAt.getTime();
  
    if (elapsedMs >= cooldownMs) {
      return;
    }
  
    const retryAfterSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
  
    throwRpcError(
      RpcErrorCode.EMAIL_VERIFICATION_RESEND_TOO_SOON,
      `You can request a new verification email in ${retryAfterSeconds} seconds`,
    );
  }

  private getResendCooldownMs(): number {
    const value = this.configService.get<string>(
      'EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS',
      '60',
    );
  
    const seconds = Number(value);
  
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error(
        'Invalid EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS value',
      );
    }
  
    return seconds * 1000;
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

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
  
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            emailVerifiedAt: true,
            deletedAt: true,
          },
        },
      },
    });
  
    if (!verificationToken) {
      throwRpcError(
        RpcErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN,
        'Invalid email verification token',
      );
    }
  
    if (verificationToken.usedAt) {
      throwRpcError(
        RpcErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN,
        'Email verification token was already used',
      );
    }
  
    if (verificationToken.expiresAt <= new Date()) {
      throwRpcError(
        RpcErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN,
        'Email verification token expired',
      );
    }
  
    if (verificationToken.user.deletedAt || verificationToken.user.status === 'DELETED') {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }
  
    if (verificationToken.user.status === 'BLOCKED') {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }
  
    if (verificationToken.user.emailVerifiedAt) {
      throwRpcError(
        RpcErrorCode.EMAIL_ALREADY_VERIFIED,
        'Email is already verified',
      );
    }
  
    const now = new Date();
  
    const user = await this.prisma.$transaction(async (tx) => {
      const updatedToken = await tx.emailVerificationToken.updateMany({
        where: {
          id: verificationToken.id,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });
  
      if (updatedToken.count === 0) {
        throwRpcError(
          RpcErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN,
          'Invalid email verification token',
        );
      }
  
      return this.usersService.activateAfterEmailVerification(
        verificationToken.userId,
        now,
        tx,
      );
    });
  
    return {
      user,
    };
  }

  async deleteExpiredAndUsedTokens(): Promise<number> {
    const now = new Date();
  
    const usedBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
    const result = await this.prisma.emailVerificationToken.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: now,
            },
          },
          {
            usedAt: {
              lt: usedBefore,
            },
          },
        ],
      },
    });
  
    return result.count;
  }
}