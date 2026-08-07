import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthKafkaService } from 'src/kafka/auth-kafka.service';
import { firstValueFrom } from 'rxjs';

import { ADMIN_AUTH_PATTERNS } from '../../kafka/patterns/admin-auth-patterns';

import { AdminGetUsersQueryDto } from './dto/admin-get-users-query.dto';
import { AdminGetUsersResponseDto } from './dto/admin-get-users-response.dto';
import { AdminGetUsersKafkaPayload } from './types/admin-get-users-kafka-payload.type';
import { AdminGetUsersKafkaResponse } from './types/admin-get-users-kafka-response.type';

import { AdminGetUserResponseDto } from './dto/admin-get-user-response.dto';
import type { AdminGetUserKafkaPayload } from './types/admin-get-user-kafka-payload.type';
import type { AdminGetUserKafkaResponse } from './types/admin-get-user-kafka-response.type';

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
}