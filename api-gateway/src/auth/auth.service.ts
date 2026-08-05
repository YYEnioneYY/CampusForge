import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientContext } from '../common/http/types/client-context.type';
import { AuthKafkaService } from '../kafka/auth-kafka.service';
import { AUTH_PATTERNS } from '../kafka/patterns/auth-patterns';

import { CommandAcknowledgement } from './types/command-acknowledgement.type';

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

import { LogoutKafkaPayload } from './types/logout/logout-kafka-payload.type';
import { LogoutAllKafkaPayload } from './types/logout/logout-all-kafka-payload.type';
import { LogoutSessionKafkaPayload } from './types/logout/logout-session-kafka-payload.type';

import { GetSessionsKafkaPayload } from './types/sessions/get-sessions-kafka-payload.type';
import { GetSessionsKafkaResponse } from './types/sessions/get-sessions-kafka-response.type';
import { GetSessionsResponseDto } from './dto/get-sessions-response.dto';
import { RenameSessionKafkaPayload } from './types/sessions/rename-session-kafka-payload.type';

import { VerifyEmailKafkaPayload } from './types/verify-email/verify-email-kafka-payload.type';
import { ResendEmailVerificationKafkaPayload } from './types/verify-email/resend-email-verification-kafka-payload.type';

import { MeKafkaPayload } from './types/me/me-kafka-payload.type';
import { MeKafkaResponse } from './types/me/me-kafka-response.type';
import { MeResponseDto } from './dto/me/me-response.dto';

import { RequestPasswordResetKafkaPayload } from './types/password-reset/request-password-reset-kafka-payload.type';
import { RequestPasswordResetDto } from './dto/password-reset/request-password-reset.dto';
import { ResetPasswordKafkaPayload } from './types/password-reset/reset-password-kafka-payload.type';
import { ResetPasswordDto } from './dto/password-reset/reset-password.dto';

import { ChangePasswordKafkaPayload } from './types/password-change/change-password-kafka-payload.type';
import { ChangePasswordRequestDto } from './dto/password-change/change-password-request.dto';

import { DeleteAccountKafkaPayload } from './types/account/delete-account-kafka-payload.type';
import { DeleteAccountRequestDto } from './dto/account/delete-account-request.dto';

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

      deviceId: clientContext.deviceId,

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

      deviceId: clientContext.deviceId,
  
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

      deviceId: clientContext.deviceId,
  
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

  async logout(
    refreshToken: string,
  ): Promise<void> {
    const payload: LogoutKafkaPayload = {
      refreshToken,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        LogoutKafkaPayload
      >(
        AUTH_PATTERNS.LOGOUT,
        payload,
      ),
    );
  }

  async logoutAll(
    refreshToken: string,
    exceptCurrent?: boolean,
  ): Promise<void> {
    const payload: LogoutAllKafkaPayload = {
      refreshToken,
      exceptCurrent,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        LogoutAllKafkaPayload
      >(
        AUTH_PATTERNS.LOGOUT_ALL,
        payload,
      ),
    );
  }

  async logoutSession(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const payload: LogoutSessionKafkaPayload = {
      userId,
      sessionId,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        LogoutSessionKafkaPayload
      >(
        AUTH_PATTERNS.LOGOUT_SESSION,
        payload,
      ),
    );
  }

  async getSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<GetSessionsResponseDto> {
    const payload: GetSessionsKafkaPayload = {
      userId,
      currentSessionId,
    };
  
    const result = await firstValueFrom(
      this.authKafkaService.send<
        GetSessionsKafkaResponse,
        GetSessionsKafkaPayload
      >(
        AUTH_PATTERNS.GET_SESSIONS,
        payload,
      ),
    );
  
    return {
      sessions: result.sessions.map((session) => ({
        id: session.id,
        deviceName: session.deviceName,
        sessionName: session.sessionName,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
  
        lastSeenAt:
          this.parseDate(
            session.lastSeenAt,
          ).toISOString(),
  
        createdAt:
          this.parseDate(
            session.createdAt,
          ).toISOString(),
  
        isCurrent: session.isCurrent,
      })),
    };
  }

  async renameSession(
    userId: string,
    currentSessionId: string,
    sessionId: string,
    sessionName: string,
  ): Promise<void> {
    const payload: RenameSessionKafkaPayload = {
      userId,
      currentSessionId,
      sessionId,
      sessionName,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        RenameSessionKafkaPayload
      >(
        AUTH_PATTERNS.RENAME_SESSION,
        payload,
      ),
    );
  }

  async verifyEmail(
    token: string,
  ): Promise<void> {
    const payload: VerifyEmailKafkaPayload = {
      token,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        VerifyEmailKafkaPayload
      >(
        AUTH_PATTERNS.VERIFY_EMAIL,
        payload,
      ),
    );
  }

  async resendEmailVerification(
    userId: string,
  ): Promise<void> {
    const payload: ResendEmailVerificationKafkaPayload = {
      userId,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        ResendEmailVerificationKafkaPayload
      >(
        AUTH_PATTERNS.RESEND_EMAIL_VERIFICATION,
        payload,
      ),
    );
  }

  async me(
    userId: string,
  ): Promise<MeResponseDto> {
    const payload: MeKafkaPayload = {
      userId,
    };
  
    const result = await firstValueFrom(
      this.authKafkaService.send<
        MeKafkaResponse,
        MeKafkaPayload
      >(
        AUTH_PATTERNS.ME,
        payload,
      ),
    );
  
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        emailVerified:
          result.user.emailVerified,
  
        emailVerifiedAt:
          result.user.emailVerifiedAt
            ? new Date(
                result.user.emailVerifiedAt,
              ).toISOString()
            : null,
  
        lastLoginAt:
          result.user.lastLoginAt
            ? new Date(
                result.user.lastLoginAt,
              ).toISOString()
            : null,
  
        createdAt: new Date(
          result.user.createdAt,
        ).toISOString(),
  
        updatedAt: new Date(
          result.user.updatedAt,
        ).toISOString(),
      },
    };
  }

  async requestPasswordReset(
    dto: RequestPasswordResetDto,
  ): Promise<void> {
    const payload: RequestPasswordResetKafkaPayload = {
      email: dto.email,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        RequestPasswordResetKafkaPayload
      >(
        AUTH_PATTERNS.PASSWORD_RESET_REQUEST,
        payload,
      ),
    );
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<void> {
    const payload: ResetPasswordKafkaPayload = {
      token: dto.token,
      newPassword: dto.newPassword,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        ResetPasswordKafkaPayload
      >(
        AUTH_PATTERNS.PASSWORD_RESET_CONFIRM,
        payload,
      ),
    );
  }

  async changePassword(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordRequestDto,
  ): Promise<void> {
    const payload: ChangePasswordKafkaPayload = {
      userId,
      currentSessionId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        ChangePasswordKafkaPayload
      >(
        AUTH_PATTERNS.CHANGE_PASSWORD,
        payload,
      ),
    );
  }

  async deleteAccount(
    userId: string,
    dto: DeleteAccountRequestDto,
  ): Promise<void> {
    const payload: DeleteAccountKafkaPayload = {
      userId,
      currentPassword: dto.currentPassword,
    };
  
    await firstValueFrom(
      this.authKafkaService.send<
        CommandAcknowledgement,
        DeleteAccountKafkaPayload
      >(
        AUTH_PATTERNS.DELETE_ACCOUNT,
        payload,
      ),
    );
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