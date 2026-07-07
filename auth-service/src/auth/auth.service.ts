import { Injectable, Logger } from '@nestjs/common';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { randomUUID } from 'node:crypto';

import { UserStatus, SystemRole } from '../generated/prisma/client';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutAllDto } from './dto/logout-all.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MeDto } from './dto/me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminGetUsersDto } from './dto/admin-get-users.dto';

import { PasswordResetService } from '../password-reset/password-reset.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../password/password.service';
import { TokenService } from '../token/token.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { PasswordChangeService } from '../password-change/password-change.service';
import { ProfileProducerService } from '../profile-producer/profile-producer.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly passwordChangeService: PasswordChangeService,
    private readonly profileProducerService: ProfileProducerService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throwRpcError(
        RpcErrorCode.USER_ALREADY_EXISTS,
        'User with this email already exists',
      );
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const user = await this.usersService.createUser({
      email,
      passwordHash,
    });

    const sessionId = randomUUID();

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.systemRole,
      status: user.status,
      emailVerified: Boolean(user.emailVerifiedAt),
      sid: sessionId,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      jti: sessionId,
    });

    await this.refreshTokenService.createSession({
      id: sessionId,
      userId: user.id,
      refreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
      deviceName: dto.deviceName,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    this.runInBackground(
      this.profileProducerService.userRegistered({
        userId: user.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
      }),
      `Failed to create profile for user ${user.id}`,
    );

    this.runInBackground(
      this.emailVerificationService.sendVerificationEmail({
        userId: user.id,
        email: user.email,
        name: 'Друг',
      }),
      `Failed to send email verification for user ${user.id}`,
    );

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmailForAuth(email);

    if (!user) {
      throwRpcError(
        RpcErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throwRpcError(
        RpcErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    if (user.deletedAt) {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }

    if (user.status === 'BLOCKED') {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }

    if (user.status === 'DELETED') {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }

    const sessionId = randomUUID();

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.systemRole,
      status: user.status,
      emailVerified: Boolean(user.emailVerifiedAt),
      sid: sessionId,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      jti: sessionId,
    });

    await this.refreshTokenService.createSession({
      id: sessionId,
      userId: user.id,
      refreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
      deviceName: dto.deviceName,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    await this.usersService.updateLastLoginAt(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        systemRole: user.systemRole,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throwRpcError(
        RpcErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
      );
    }

    const session = await this.refreshTokenService.findActiveSession({
      id: payload.jti,
      userId: payload.sub,
      refreshToken: dto.refreshToken,
    });

    if (!session) {
      throwRpcError(
        RpcErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
      );
    }

    if (session.user.deletedAt || session.user.status === 'DELETED') {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }

    if (session.user.status === 'BLOCKED') {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }

    const newSessionId = randomUUID();

    const accessToken = await this.tokenService.generateAccessToken({
      sub: session.user.id,
      email: session.user.email,
      role: session.user.systemRole,
      status: session.user.status,
      emailVerified: Boolean(session.user.emailVerifiedAt),
      sid: newSessionId
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: session.user.id,
      jti: newSessionId,
    });

    await this.refreshTokenService.rotateSession({
      oldSessionId: session.id,
      newSession: {
        id: newSessionId,
        userId: session.user.id,
        refreshToken,
        expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
        deviceName: dto.deviceName ?? session.deviceName,
        ipAddress: dto.ipAddress ?? session.ipAddress,
        userAgent: dto.userAgent ?? session.userAgent,
      },
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        systemRole: session.user.systemRole,
        status: session.user.status,
        emailVerifiedAt: session.user.emailVerifiedAt,
        createdAt: session.user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async logoutAll(dto: LogoutAllDto) {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throwRpcError(
        RpcErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
      );
    }

    const session = await this.refreshTokenService.findActiveSession({
      id: payload.jti,
      userId: payload.sub,
      refreshToken: dto.refreshToken,
    });

    if (!session) {
      throwRpcError(
        RpcErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
      );
    }

    if (dto.exceptCurrent) {
      await this.refreshTokenService.revokeAllUserTokensExcept(
        session.userId,
        session.id,
      );
    } else {
      await this.refreshTokenService.revokeAllUserTokens(session.userId);
    }

    return {
      success: true,
    };
  }

  async logout(dto: LogoutDto) {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throwRpcError(
        RpcErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
      );
    }

    const session = await this.refreshTokenService.findActiveSession({
      id: payload.jti,
      userId: payload.sub,
      refreshToken: dto.refreshToken,
    });

    if (!session) {
      throwRpcError(
        RpcErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
      );
    }

    await this.refreshTokenService.revokeById(session.id);

    return {
      success: true,
    };
  }

  async logoutSession(dto: LogoutSessionDto) {
    const wasRevoked = await this.refreshTokenService.revokeUserSession(
      dto.userId,
      dto.sessionId,
    );

    if (!wasRevoked) {
      throwRpcError(
        RpcErrorCode.SESSION_NOT_FOUND,
        'Active session was not found',
      );
    }

    return {
      success: true,
    };
  }

  async getSessions(dto: GetSessionsDto) {
    const sessions = await this.refreshTokenService.getUserSessions({
      userId: dto.userId,
      currentSessionId: dto.currentSessionId,
    });

    return {
      sessions,
    };
  }

  async resendEmailVerification(dto: ResendEmailVerificationDto) {
    const user = await this.usersService.findByIdForEmailVerification(dto.userId);

    if (!user) {
      throwRpcError(
        RpcErrorCode.USER_NOT_FOUND,
        'User was not found',
      );
    }

    if (user.deletedAt || user.status === 'DELETED') {
      throwRpcError(
        RpcErrorCode.USER_DELETED,
        'User account was deleted',
      );
    }

    if (user.status === 'BLOCKED') {
      throwRpcError(
        RpcErrorCode.USER_BLOCKED,
        'User account is blocked',
      );
    }

    if (user.emailVerifiedAt) {
      throwRpcError(
        RpcErrorCode.EMAIL_ALREADY_VERIFIED,
        'Email is already verified',
      );
    }

    const { verificationUrl } =
      await this.emailVerificationService.createVerificationToken(user.id, {
        enforceCooldown: true,
      });
    
    this.runInBackground(
      this.emailVerificationService.sendVerificationEmailEvent({
        userId: user.id,
        email: user.email,
        verificationUrl,
        name: 'Друг',
      }),
      `Failed to send email verification event for user ${user.id}`,
    );

    return {
      success: true,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    return this.emailVerificationService.verifyEmail(dto.token);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmailForPasswordReset(email);

    if (!user) {
      return {
        success: true,
      };
    }

    if (user.deletedAt || user.status === UserStatus.DELETED) {
      return {
        success: true,
      };
    }

    if (user.status === UserStatus.BLOCKED) {
      return {
        success: true,
      };
    }

    this.runInBackground(
      this.passwordResetService.requestPasswordResetEmail({
        userId: user.id,
        email: user.email,
        name: 'Друг',
      }),
      `Failed to request password reset for user ${user.id}`,
    );

    return {
      success: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { user } = await this.passwordResetService.resetPassword(
      dto.token,
      dto.newPassword,
    );

    this.runInBackground(
      this.passwordResetService.sendPasswordChangedEmailEvent({
        userId: user.id,
        email: user.email,
        name: 'Друг',
      }),
      `Failed to send password changed email for user ${user.id}`,
    );

    return {
      success: true,
    };
  }

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.passwordChangeService.changePassword({
      userId: dto.userId,
      currentSessionId: dto.currentSessionId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  
    this.runInBackground(
      this.passwordResetService.sendPasswordChangedEmailEvent({
        userId: user.id,
        email: user.email,
        name: 'Друг',
      }),
      `Failed to send password changed email for user ${user.id}`,
    );
  
    return {
      success: true,
    };
  }

  async me(dto: MeDto) {
    const user = await this.usersService.findMeById(dto.userId);

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

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.systemRole,
        status: user.status,
        emailVerified: Boolean(user.emailVerifiedAt),
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async adminGetUsers(dto: AdminGetUsersDto) {
    const actor = await this.usersService.findByIdForAdminCheck(dto.actorUserId);

    if (!actor) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'Access denied',
      );
    }

    if (actor.deletedAt || actor.status === UserStatus.DELETED) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'Access denied',
      );
    }

    if (actor.status !== UserStatus.ACTIVE) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'Access denied',
      );
    }

    if (actor.systemRole !== SystemRole.ADMIN) {
      throwRpcError(
        RpcErrorCode.FORBIDDEN,
        'Admin role is required',
      );
    }

    return this.usersService.getUsersPage({
      page: dto.page,
      limit: dto.limit,
      search: dto.search,
      status: dto.status,
      role: dto.role,
    });
  }

  private runInBackground(
    promise: Promise<void>,
    errorMessage: string,
  ): void {
    void promise.catch((error) => {
      this.logger.error(
        errorMessage,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }
}