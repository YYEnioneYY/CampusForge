import { Injectable } from '@nestjs/common';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { randomUUID } from 'node:crypto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutAllDto } from './dto/logout-all.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';

import { UsersService } from '../users/users.service';
import { PasswordService } from '../password/password.service';
import { TokenService } from '../token/token.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly emailVerificationService: EmailVerificationService,
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
      phone: dto.phone,
      passwordHash,
    });

    const sessionId = randomUUID();

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.systemRole,
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

    await this.emailVerificationService.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      name: 'Друг',
    });

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
        phone: user.phone,
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
        phone: session.user.phone,
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
}