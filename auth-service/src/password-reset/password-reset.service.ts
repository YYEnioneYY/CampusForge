import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import { UserStatus } from '../generated/prisma/client';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { NotificationProducerService } from '../notification-producer/notification-producer.service';
import { PasswordService } from '../password/password.service';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UsersService } from '../users/users.service';
import { PasswordResetRepository } from './password-reset.repository';
import { CreatePasswordResetTokenResult } from './types/create-password-reset-token-result.type';
import { RequestPasswordResetEmailInput } from './types/request-password-reset-email.input';
import { SendPasswordChangedEmailEventInput } from './types/send-password-changed-email-event.input';
import { AccessRevocationService } from '../access-revocation/access-revocation.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly notificationProducerService: NotificationProducerService,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly accessRevocationService: AccessRevocationService,
  ) {}

  async requestPasswordResetEmail(
    input: RequestPasswordResetEmailInput,
  ): Promise<void> {
    const canRequest = await this.canRequestPasswordReset(input.userId);

    if (!canRequest) {
      return;
    }

    const { resetUrl } = await this.createPasswordResetToken(
      input.userId,
    );

    await this.notificationProducerService.sendPasswordReset({
      userId: input.userId,
      email: input.email,
      resetUrl,
      name: input.name,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);

    const resetToken =
      await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throwRpcError(
        RpcErrorCode.INVALID_PASSWORD_RESET_TOKEN,
        'Invalid password reset token',
      );
    }

    if (resetToken.usedAt) {
      throwRpcError(
        RpcErrorCode.INVALID_PASSWORD_RESET_TOKEN,
        'Password reset token was already used',
      );
    }

    const now = new Date();

    if (resetToken.expiresAt <= now) {
      throwRpcError(
        RpcErrorCode.INVALID_PASSWORD_RESET_TOKEN,
        'Password reset token expired',
      );
    }

    if (
      resetToken.user.deletedAt ||
      resetToken.user.status === UserStatus.DELETED
    ) {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }

    if (resetToken.user.status === UserStatus.BLOCKED) {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }

    const passwordHash =
      await this.passwordService.hashPassword(newPassword);

    const user = await this.prisma.$transaction(async (tx) => {
      const tokenMarkedAsUsed =
        await this.passwordResetRepository.markAsUsedIfActiveInTransaction(
          resetToken.id,
          now,
          tx,
        );

      if (!tokenMarkedAsUsed) {
        throwRpcError(
          RpcErrorCode.INVALID_PASSWORD_RESET_TOKEN,
          'Invalid password reset token',
        );
      }

      await this.passwordResetRepository.invalidateUnusedTokensForUserInTransaction(
        resetToken.userId,
        now,
        tx,
      );

      const updatedUser = await this.usersService.updatePassword(
        resetToken.userId,
        passwordHash,
        tx,
      );

      await this.refreshTokenService.revokeAllUserTokensInTransaction(
        resetToken.userId,
        now,
        tx,
      );

      return updatedUser;
    });

    await this.accessRevocationService.revokeUserAccessTokens(
      resetToken.userId,
      now,
    );

    return {
      user,
    };
  }

  async sendPasswordChangedEmailEvent(
    input: SendPasswordChangedEmailEventInput,
  ): Promise<void> {
    await this.notificationProducerService.sendPasswordChanged({
      userId: input.userId,
      email: input.email,
      name: input.name,
    });
  }

  private async createPasswordResetToken(
    userId: string,
  ): Promise<CreatePasswordResetTokenResult> {
    const now = new Date();

    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getExpiresAt();

    await this.passwordResetRepository.invalidateUnusedTokensAndCreate({
      userId,
      tokenHash,
      expiresAt,
      invalidatedAt: now,
    });

    return {
      resetUrl: this.buildResetUrl(token),
      expiresAt,
    };
  }

  private async canRequestPasswordReset(
    userId: string,
  ): Promise<boolean> {
    const cooldownMs = this.getRequestCooldownMs();

    if (cooldownMs === 0) {
      return true;
    }

    const lastTokenCreatedAt =
      await this.passwordResetRepository.findLatestCreatedAtByUserId(
        userId,
      );

    if (!lastTokenCreatedAt) {
      return true;
    }

    const elapsedMs = Date.now() - lastTokenCreatedAt.getTime();

    return elapsedMs >= cooldownMs;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    const secret = this.configService.getOrThrow<string>(
      'PASSWORD_RESET_TOKEN_HASH_SECRET',
    );

    return createHmac('sha256', secret)
      .update(token)
      .digest('hex');
  }

  private buildResetUrl(token: string): string {
    const frontendUrl =
      this.configService.getOrThrow<string>('FRONTEND_URL');

    const url = new URL('/reset-password', frontendUrl);

    url.searchParams.set('token', token);

    return url.toString();
  }

  private getExpiresAt(): Date {
    const expiresIn = this.configService.get<string>(
      'PASSWORD_RESET_TOKEN_EXPIRES_IN',
      '15m',
    );

    return this.expiresInToDate(expiresIn);
  }

  private getRequestCooldownMs(): number {
    const value = this.configService.get<string>(
      'PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS',
      '60',
    );

    const seconds = Number(value);

    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error(
        'Invalid PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS value',
      );
    }

    return seconds * 1000;
  }

  private expiresInToDate(value: string): Date {
    const normalizedValue = value.trim();

    const match = normalizedValue.match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
      throw new Error(
        'Invalid password reset expiration format. Use values like 15m, 1h, 1d',
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

    return new Date(
      Date.now() + amount * multiplierMap[unit],
    );
  }
}