import { Injectable } from '@nestjs/common';
import { RpcErrorCode } from '../common/rpc/rpc-error-code';
import { throwRpcError } from '../common/rpc/throw-rpc-error';
import { randomUUID } from 'node:crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../password/password.service';
import { TokenService } from '../token/token.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
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
}