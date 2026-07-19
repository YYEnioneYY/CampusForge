import { Injectable } from '@nestjs/common';
import { SystemRole, UserStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AccessRevocationService } from 'src/access-revocation/access-revocation.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';

type BlockUserInput = {
  actorUserId: string;
  targetUserId: string;
};

type UnblockUserInput = {
  actorUserId: string;
  targetUserId: string;
};

type GetUsersInput = {
  actorUserId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: SystemRole;
};

type GetUserInput = {
  actorUserId: string;
  targetUserId: string;
};

type ChangeUserRoleInput = {
  actorUserId: string;
  targetUserId: string;
  newRole: SystemRole;
};

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessRevocationService: AccessRevocationService,
  ) {}

  async getUsers(input: GetUsersInput) {
    await this.assertActiveAdmin(input.actorUserId);

    return this.usersService.getUsersPage({
      page: input.page,
      limit: input.limit,
      search: input.search,
      status: input.status,
      role: input.role,
    });
  }

  async blockUser(input: BlockUserInput) {
    await this.assertActiveAdmin(input.actorUserId);

    if (input.actorUserId === input.targetUserId) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'You cannot block yourself',
      );
    }

    const targetUser = await this.usersService.findByIdForAdminAction(
      input.targetUserId,
    );

    if (!targetUser || targetUser.deletedAt) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }

    if (targetUser.systemRole === SystemRole.ADMIN) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'You cannot block another admin',
      );
    }

    if (targetUser.status === UserStatus.BLOCKED) {
      return {
        success: true,
        user: this.usersService.mapUserForAdminResponse(targetUser),
      };
    }

    const now = new Date();

    const blockedUser = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await this.usersService.updateUserStatusInTransaction(
        input.targetUserId,
        UserStatus.BLOCKED,
        tx,
      );

      await this.refreshTokenService.revokeAllUserTokensInTransaction(
        input.targetUserId,
        now,
        tx,
      );

      return updatedUser;
    });

    await this.accessRevocationService.revokeUserAccessTokens(
      input.targetUserId,
      now,
    );

    return {
      success: true,
      user: this.usersService.mapUserForAdminResponse(blockedUser),
    };
  }

  async unblockUser(input: UnblockUserInput) {
    await this.assertActiveAdmin(input.actorUserId);
  
    const targetUser =
      await this.usersService.findByIdForAdminAction(
        input.targetUserId,
      );
  
    if (!targetUser || targetUser.deletedAt) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }
  
    if (targetUser.status !== UserStatus.BLOCKED) {
      return {
        success: true,
        user: this.usersService.mapUserForAdminResponse(
          targetUser,
        ),
      };
    }
  
    const nextStatus = targetUser.emailVerifiedAt
      ? UserStatus.ACTIVE
      : UserStatus.PENDING;
  
    const unblockedUser =
      await this.usersService.updateUserStatus(
        targetUser.id,
        nextStatus,
      );
  
    return {
      success: true,
      user: this.usersService.mapUserForAdminResponse(
        unblockedUser,
      ),
    };
  }

  async getUser(input: GetUserInput) {
    await this.assertActiveAdmin(input.actorUserId);
  
    const user =
      await this.usersService.findByIdForAdminAction(
        input.targetUserId,
      );
  
    if (!user) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }
  
    const activeSessionsCount =
      await this.refreshTokenService.countActiveUserSessions(
        user.id,
      );
  
    return {
      success: true,
      user: {
        ...this.usersService.mapUserForAdminResponse(user),
        activeSessionsCount,
      },
    };
  }

  async changeUserRole(
    input: ChangeUserRoleInput,
  ) {
    await this.assertActiveAdmin(input.actorUserId);
  
    if (input.actorUserId === input.targetUserId) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'Administrator cannot change their own role',
      );
    }
  
    const targetUser =
      await this.usersService.findByIdForAdminAction(
        input.targetUserId,
      );
  
    if (
      !targetUser ||
      targetUser.deletedAt ||
      targetUser.status === UserStatus.DELETED
    ) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }
  
    if (targetUser.systemRole === input.newRole) {
      return {
        success: true,
        user:
          this.usersService.mapUserForAdminResponse(
            targetUser,
          ),
      };
    }
  
    const changedAt = new Date();
  
    const updatedUser =
      await this.prisma.$transaction(async (tx) => {
        const user =
          await this.usersService.updateUserRoleInTransaction(
            targetUser.id,
            input.newRole,
            tx,
          );
      
        await this.refreshTokenService.revokeAllUserTokensInTransaction(
          targetUser.id,
          changedAt,
          tx,
        );
      
        return user;
      });
  
    await this.accessRevocationService.revokeUserAccessTokens(
      targetUser.id,
      changedAt,
    );
  
    return {
      success: true,
      user:
        this.usersService.mapUserForAdminResponse(
          updatedUser,
        ),
    };
  }

  private async assertActiveAdmin(actorUserId: string): Promise<void> {
    const actor = await this.usersService.findByIdForAdminCheck(actorUserId);

    if (
      !actor ||
      actor.deletedAt ||
      actor.status !== UserStatus.ACTIVE ||
      actor.systemRole !== SystemRole.ADMIN
    ) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'Admin role is required',
      );
    }
  }
}