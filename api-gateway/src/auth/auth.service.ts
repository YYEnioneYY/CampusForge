import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientContext } from '../common/http/types/client-context.type';
import { AuthKafkaService } from '../kafka/auth-kafka.service';
import { AUTH_PATTERNS } from '../kafka/patterns/auth-patterns';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import type { RegisterKafkaResponse } from './types/register-kafka-response.type';

type RegisterKafkaPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};

export type RegisterResult = {
  body: RegisterResponseDto;

  refreshToken: {
    value: string;
    expiresAt: Date;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authKafkaService:
      AuthKafkaService,
  ) {}

  async register(
    dto: RegisterDto,
    clientContext: ClientContext,
  ): Promise<RegisterResult> {
    const payload: RegisterKafkaPayload = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,

      ipAddress:
        clientContext.ipAddress,

      userAgent:
        clientContext.userAgent,

      deviceName:
        clientContext.deviceName,
    };

    const result = await firstValueFrom(
      this.authKafkaService.send<
        RegisterKafkaResponse,
        RegisterKafkaPayload
      >(
        AUTH_PATTERNS.REGISTER,
        payload,
      ),
    );

    const accessTokenExpiresAt =
      this.parseDate(
        result.tokens.accessTokenExpiresAt,
      );

    const refreshTokenExpiresAt =
      this.parseDate(
        result.tokens.refreshTokenExpiresAt,
      );

    return {
      body: {
        accessToken:
          result.tokens.accessToken,

        accessTokenExpiresAt:
          accessTokenExpiresAt.toISOString(),

        user: {
          id: result.user.id,
          email: result.user.email,

          systemRole:
            result.user.systemRole,

          status:
            result.user.status,

          emailVerifiedAt:
            result.user.emailVerifiedAt
              ? this.parseDate(
                  result.user
                    .emailVerifiedAt,
                ).toISOString()
              : null,

          createdAt:
            this.parseDate(
              result.user.createdAt,
            ).toISOString(),
        },
      },

      refreshToken: {
        value:
          result.tokens.refreshToken,

        expiresAt:
          refreshTokenExpiresAt,
      },
    };
  }

  private parseDate(
    value: string | Date,
  ): Date {
    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadGatewayException(
        'Auth service returned an invalid response',
      );
    }

    return date;
  }
}