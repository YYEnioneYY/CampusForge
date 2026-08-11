import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthKafkaService } from 'src/kafka/auth-kafka.service';
import { firstValueFrom } from 'rxjs';

import { ADMIN_AUTH_PATTERNS } from '../../kafka/patterns/admin-auth-patterns';

import { CommandAcknowledgement } from '../../common/types/command-acknowledgement.type';

import { AdminGetUsersQueryDto } from './dto/admin-get-users-query.dto';
import { AdminGetUsersResponseDto } from './dto/admin-get-users-response.dto';
import { AdminGetUsersKafkaPayload } from './types/admin-get-users-kafka-payload.type';
import { AdminGetUsersKafkaResponse } from './types/admin-get-users-kafka-response.type';

import { AdminGetUserResponseDto } from './dto/admin-get-user-response.dto';
import type { AdminGetUserKafkaPayload } from './types/admin-get-user-kafka-payload.type';
import type { AdminGetUserKafkaResponse } from './types/admin-get-user-kafka-response.type';

import { AdminBlockUserKafkaPayload } from './types/admin-block-user-kafka-payload.type';
import { AdminUnblockUserKafkaPayload } from './types/admin-unblock-user-kafka-payload.type';

import { AdminChangeUserRoleDto } from './dto/admin-change-user-role.dto';
import { AdminChangeUserRoleKafkaPayload } from './types/admin-change-user-role-kafka-payload.type';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly authKafkaService: AuthKafkaService,
  ) {}

  async getUsers(
    actorUserId: string,
    query: AdminGetUsersQueryDto,
  ): Promise<AdminGetUsersResponseDto> {
    const search = query.search?.trim() || undefined;
    const payload: AdminGetUsersKafkaPayload = {
      actorUserId,
  
      page: query.page,
      limit: query.limit,
  
      search,
      status: query.status,
      role: query.role,
    };
  
    return firstValueFrom(
      this.authKafkaService.send<
        AdminGetUsersKafkaResponse,
        AdminGetUsersKafkaPayload
      >(
        ADMIN_AUTH_PATTERNS.ADMIN_GET_USERS,
        payload,
      ),
    );
  }

  async getUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<AdminGetUserResponseDto> {
    const payload:
      AdminGetUserKafkaPayload = {
        actorUserId,
        targetUserId,
      };

    return firstValueFrom(
      this.authKafkaService.send<
        AdminGetUserKafkaResponse,
        AdminGetUserKafkaPayload
      >(
        ADMIN_AUTH_PATTERNS.ADMIN_GET_USER,
        payload,
      ),
    );
  }

  async blockUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<void> {
    const payload: AdminBlockUserKafkaPayload = {
      actorUserId,
      targetUserId,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        AdminBlockUserKafkaPayload
      >(
        ADMIN_AUTH_PATTERNS.ADMIN_BLOCK_USER,
        payload,
      ),
    );
  }

  async unblockUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<void> {
    const payload: AdminUnblockUserKafkaPayload = {
      actorUserId,
      targetUserId,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        AdminUnblockUserKafkaPayload
      >(
        ADMIN_AUTH_PATTERNS.ADMIN_UNBLOCK_USER,
        payload,
      ),
    );
  }

  async changeUserRole(
    actorUserId: string,
    targetUserId: string,
    dto: AdminChangeUserRoleDto,
  ): Promise<void> {
    const payload:
      AdminChangeUserRoleKafkaPayload = {
        actorUserId,
        targetUserId,
        newRole: dto.newRole,
      };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        AdminChangeUserRoleKafkaPayload
      >(
        ADMIN_AUTH_PATTERNS.ADMIN_CHANGE_USER_ROLE,
        payload,
      ),
    );
  }
}