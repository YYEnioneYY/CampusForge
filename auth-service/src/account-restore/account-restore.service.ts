import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import { UserStatus } from '../generated/prisma/client';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { NotificationProducerService } from '../notification-producer/notification-producer.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AccountRestoreRepository } from './account-restore.repository';
import { CreateAccountRestoreTokenResult } from './types/create-account-restore-token-result.type';
import { RequestAccountRestoreEmailInput } from './types/request-account-restore-email.input';

@Injectable()
export class AccountRestoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly notificationProducerService:
      NotificationProducerService,
    private readonly accountRestoreRepository:
      AccountRestoreRepository,
  ) {}

  async requestAccountRestoreEmail(
    input: RequestAccountRestoreEmailInput,
  ): Promise<void> {
    const canRequest =
      await this.canRequestAccountRestore(input.userId);

    if (!canRequest) {
      return;
    }

    const { restoreUrl } =
      await this.createAccountRestoreToken(
        input.userId,
      );

    await this.notificationProducerService.sendAccountRestore({
      email: input.email,
      restoreUrl,
      name: input.name,
    });
  }

  async confirmAccountRestore(token: string) {
    const tokenHash = this.hashToken(token);

    const restoreToken =
      await this.accountRestoreRepository.findByTokenHash(
        tokenHash,
      );

    if (!restoreToken) {
      throwRpcError(
        RpcErrorCode.INVALID_ACCOUNT_RESTORE_TOKEN,
        'Invalid account restore token',
      );
    }

    if (restoreToken.usedAt) {
      throwRpcError(
        RpcErrorCode.INVALID_ACCOUNT_RESTORE_TOKEN,
        'Account restore token was already used',
      );
    }

    const now = new Date();

    if (restoreToken.expiresAt <= now) {
      throwRpcError(
        RpcErrorCode.INVALID_ACCOUNT_RESTORE_TOKEN,
        'Account restore token expired',
      );
    }

    if (
      !restoreToken.user.deletedAt ||
      restoreToken.user.status !== UserStatus.DELETED
    ) {
      throwRpcError(
        RpcErrorCode.INVALID_ACCOUNT_RESTORE_TOKEN,
        'Account cannot be restored',
      );
    }

    const nextStatus =
      restoreToken.user.emailVerifiedAt
        ? UserStatus.ACTIVE
        : UserStatus.PENDING;

    const user =
      await this.prisma.$transaction(async (tx) => {
        const tokenMarkedAsUsed =
          await this.accountRestoreRepository.markAsUsedIfActiveInTransaction(
            restoreToken.id,
            now,
            tx,
          );

        if (!tokenMarkedAsUsed) {
          throwRpcError(
            RpcErrorCode.INVALID_ACCOUNT_RESTORE_TOKEN,
            'Invalid account restore token',
          );
        }

        await this.accountRestoreRepository.invalidateUnusedTokensForUserInTransaction(
          restoreToken.userId,
          now,
          tx,
        );

        return this.usersService.restoreUserInTransaction(
          restoreToken.userId,
          nextStatus,
          tx,
        );
      });

    return {
      user,
    };
  }

  private async createAccountRestoreToken(
    userId: string,
  ): Promise<CreateAccountRestoreTokenResult> {
    const now = new Date();

    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getExpiresAt();

    await this.accountRestoreRepository.invalidateUnusedTokensAndCreate(
      {
        userId,
        tokenHash,
        expiresAt,
        invalidatedAt: now,
      },
    );

    return {
      restoreUrl: this.buildRestoreUrl(token),
      expiresAt,
    };
  }

  private async canRequestAccountRestore(
    userId: string,
  ): Promise<boolean> {
    const cooldownMs = this.getRequestCooldownMs();

    if (cooldownMs === 0) {
      return true;
    }

    const lastTokenCreatedAt =
      await this.accountRestoreRepository.findLatestCreatedAtByUserId(
        userId,
      );

    if (!lastTokenCreatedAt) {
      return true;
    }

    const elapsedMs =
      Date.now() - lastTokenCreatedAt.getTime();

    return elapsedMs >= cooldownMs;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    const secret =
      this.configService.getOrThrow<string>(
        'ACCOUNT_RESTORE_TOKEN_HASH_SECRET',
      );

    return createHmac('sha256', secret)
      .update(token)
      .digest('hex');
  }

  private buildRestoreUrl(token: string): string {
    const frontendUrl =
      this.configService.getOrThrow<string>(
        'FRONTEND_URL',
      );

    const url = new URL(
      '/restore-account',
      frontendUrl,
    );

    url.searchParams.set('token', token);

    return url.toString();
  }

  private getExpiresAt(): Date {
    const expiresIn =
      this.configService.get<string>(
        'ACCOUNT_RESTORE_TOKEN_EXPIRES_IN',
        '1h',
      );

    return this.expiresInToDate(expiresIn);
  }

  private getRequestCooldownMs(): number {
    const value =
      this.configService.get<string>(
        'ACCOUNT_RESTORE_REQUEST_COOLDOWN_SECONDS',
        '60',
      );

    const seconds = Number(value);

    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      throw new Error(
        'Invalid ACCOUNT_RESTORE_REQUEST_COOLDOWN_SECONDS value',
      );
    }

    return seconds * 1000;
  }

  private expiresInToDate(value: string): Date {
    const normalizedValue = value.trim();

    const match =
      normalizedValue.match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
      throw new Error(
        'Invalid account restore expiration format. Use values like 15m, 1h, 1d',
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
      Date.now() +
        amount * multiplierMap[unit],
    );
  }
}