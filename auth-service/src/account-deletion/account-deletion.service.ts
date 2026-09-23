import { Injectable } from '@nestjs/common';
import { UserStatus } from '../generated/prisma/client';
import { AccessRevocationService } from '../access-revocation/access-revocation.service';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { PasswordService } from '../password/password.service';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UsersService } from '../users/users.service';
import { DeleteAccountInput } from './types/delete-account.input';

import { OutboxService } from '../outbox/outbox.service';
import { USER_EVENT_PATTERNS } from '../common/kafka/user-event-patterns';

@Injectable()
export class AccountDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessRevocationService: AccessRevocationService,
    private readonly outboxService: OutboxService,
  ) {}

  async deleteAccount(input: DeleteAccountInput) {
    const user =
      await this.usersService.findByIdForSensitiveAction(
        input.userId,
      );

    if (!user) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }

    if (
      user.deletedAt ||
      user.status === UserStatus.DELETED
    ) {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was already deleted',
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }

    const isPasswordValid =
      await this.passwordService.verifyPassword(
        input.currentPassword,
        user.passwordHash,
      );

    if (!isPasswordValid) {
      throwRpcError(
        RpcErrorCode.INVALID_CURRENT_PASSWORD,
        'Current password is invalid',
      );
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await this.usersService.softDeleteInTransaction(
        input.userId,
        now,
        tx,
      );

      await this.refreshTokenService.revokeAllUserTokensInTransaction(
        input.userId,
        now,
        tx,
      );

      await this.outboxService.enqueue(
        tx,
        {
          topic:
            USER_EVENT_PATTERNS.ACCOUNT_DELETED,
        
          eventType:
            'user.account.deleted',
        
          eventVersion: 1,
        
          aggregateType:
            'User',
        
          aggregateId:
            input.userId,
        
          partitionKey:
            input.userId,
        
          payload: {
            userId:
              input.userId,
          
            deletedAt:
              now.toISOString(),
          },
        },
      );
    });

    await this.accessRevocationService.revokeUserAccessTokens(
      input.userId,
      now,
    );

    return {
      success: true,
    };
  }
}