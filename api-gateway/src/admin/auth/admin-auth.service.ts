import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthKafkaService } from 'src/kafka/auth-kafka.service';
import {
  firstValueFrom,
} from 'rxjs';

import {
  ADMIN_AUTH_PATTERNS,
} from '../../kafka/patterns/admin-auth-patterns';
import {
  AdminGetUserResponseDto,
} from './dto/admin-get-user-response.dto';
import type {
  AdminGetUserKafkaPayload,
} from './types/admin-get-user-kafka-payload.type';
import type {
  AdminGetUserKafkaResponse,
} from './types/admin-get-user-kafka-response.type';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly authKafkaService: AuthKafkaService,
  ) {}

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