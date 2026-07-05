import { Injectable } from '@nestjs/common';
import { UserStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../password/password.service';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { ChangePasswordInput } from './types/change-password.input';

@Injectable()
export class PasswordChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async changePassword(input: ChangePasswordInput) {
    const user = await this.usersService.findByIdForPasswordChange(
      input.userId,
    );

    if (!user) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }

    if (user.deletedAt || user.status === UserStatus.DELETED) {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }

    const isCurrentPasswordValid =
      await this.passwordService.verifyPassword(
        input.currentPassword,
        user.passwordHash,
      );

    if (!isCurrentPasswordValid) {
      throwRpcError(
        RpcErrorCode.INVALID_CURRENT_PASSWORD,
        'Current password is invalid',
      );
    }

    const newPasswordHash = await this.passwordService.hashPassword(
      input.newPassword,
    );

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await this.usersService.updatePassword(
        user.id,
        newPasswordHash,
        tx,
      );

      await this.refreshTokenService.revokeAllUserTokensExceptInTransaction(
        user.id,
        input.currentSessionId,
        now,
        tx,
      );

      return updatedUser;
    });
  }
}