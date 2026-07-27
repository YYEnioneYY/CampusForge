import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientContext } from '../common/http/types/client-context.type';
import { AuthKafkaService } from '../kafka/auth-kafka.service';
import { AUTH_PATTERNS } from '../kafka/patterns/auth-patterns';

import { RegisterDto } from './dto/register.dto';
import { RegisterKafkaResponse } from './types/register/register-kafka-response.type';
import { RegisterKafkaPayload } from './types/register/register-kafka-payload.type';
import { RegisterResult } from './types/register/register-result.type';

import { LoginDto } from './dto/login.dto';
import { LoginKafkaResponse } from './types/login/login-kafka-response.type';
import { LoginKafkaPayload } from './types/login/login-kafka-payload.type';
import { LoginResult } from './types/login/login-result.type';

import { RefreshKafkaResponse } from './types/refresh/refresh-kafka-response.type';
import { RefreshKafkaPayload } from './types/refresh/refresh-kafka-payload.type';
import { RefreshResult } from './types/refresh/refresh-result.type';

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

  async login(
    dto: LoginDto,
    clientContext: ClientContext,
  ): Promise<LoginResult> {
    const payload: LoginKafkaPayload = {
      email: dto.email,
      password: dto.password,
  
      ipAddress:
        clientContext.ipAddress,
  
      userAgent:
        clientContext.userAgent,
  
      deviceName:
        clientContext.deviceName,
    };  
    const result = await firstValueFrom(
      this.authKafkaService.send<
        LoginKafkaResponse,
        LoginKafkaPayload
      >(
        AUTH_PATTERNS.LOGIN,
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
                  result.user.emailVerifiedAt,
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

  async refresh(
    refreshToken: string,
    clientContext: ClientContext,
  ): Promise<RefreshResult> {
    const payload: RefreshKafkaPayload = {
      refreshToken,
  
      ipAddress:
        clientContext.ipAddress,
  
      userAgent:
        clientContext.userAgent,
  
      deviceName:
        clientContext.deviceName,
    };
  
    const result = await firstValueFrom(
      this.authKafkaService.send<
        RefreshKafkaResponse,
        RefreshKafkaPayload
      >(
        AUTH_PATTERNS.REFRESH,
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