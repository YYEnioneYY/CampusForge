import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '../../generated/prisma/client';
import { parseDurationToSeconds, secondsFromNow } from '../utils/duration.util';
import {
  AuthTokens,
  AuthTokenUser,
  JwtAccessPayload,
  JwtRefreshPayload,
  TokenSessionMetadata,
} from './tokens.types';

@Injectable()
export class TokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthTokens(
    user: AuthTokenUser,
    metadata?: TokenSessionMetadata,
  ): Promise<AuthTokens> {
    const accessSecret = this.getRequiredConfig('JWT_ACCESS_SECRET');
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
  
    const accessTokenExpiresIn = this.getTokenExpiresIn(
      'JWT_ACCESS_EXPIRES_IN',
      15 * 60,
    );
  
    const refreshTokenExpiresIn = this.getTokenExpiresIn(
      'JWT_REFRESH_EXPIRES_IN',
      7 * 24 * 60 * 60,
    );
  
    const refreshTokenId = randomUUID();
  
    const accessPayload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.systemRole,
      status: user.status,
      tokenType: 'access',
    };
  
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      jti: refreshTokenId,
      tokenType: 'refresh',
    };
  
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);
  
    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
      
        deviceName: metadata?.deviceName ?? null,
        ipAddress: metadata?.ipAddress ?? null,
        userAgent: metadata?.userAgent ?? null,
      
        expiresAt: secondsFromNow(refreshTokenExpiresIn),
      },
    });
  
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');

    let payload: JwtRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Некорректный refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Некорректный тип токена');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token не найден или отозван');
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException('Refresh token истёк');
    }

    if (
      storedToken.user.status === 'BLOCKED' ||
      storedToken.user.status === 'DELETED' ||
      storedToken.user.deletedAt
    ) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return this.generateAuthTokens({
      id: storedToken.user.id,
      email: storedToken.user.email,
      systemRole: storedToken.user.systemRole,
      status: storedToken.user.status,
    });
  }

  async revokeRefreshToken(refreshToken: string) {
    const storedToken = await this.getValidStoredRefreshToken(refreshToken);

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      userId: storedToken.userId,
    };
  }

  async revokeAllRefreshTokens(refreshToken: string) {
    const storedToken = await this.getValidStoredRefreshToken(refreshToken);

    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      userId: storedToken.userId,
      revokedCount: result.count,
    };
  }

  async getUserSessions(refreshToken: string) {
    const storedToken = await this.getValidStoredRefreshToken(refreshToken);

    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        deviceName: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      isCurrent: session.id === storedToken.id,
    }));
  }

  async revokeUserSession(refreshToken: string, sessionId: string) {
    const storedToken = await this.getValidStoredRefreshToken(refreshToken);

    const session = await this.prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId: storedToken.userId,
        revokedAt: null,
      },
      select: {
        id: true,
        userId: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Сессия не найдена или уже завершена');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      sessionId: session.id,
      isCurrent: session.id === storedToken.id,
    };
  }

  private async getValidStoredRefreshToken(refreshToken: string) {
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');

    let payload: JwtRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Некорректный refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Некорректный тип токена');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        id: payload.jti,
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token не найден или уже отозван');
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException('Refresh token истёк');
    }

    if (
      storedToken.user.status === 'BLOCKED' ||
      storedToken.user.status === 'DELETED' ||
      storedToken.user.deletedAt
    ) {
      throw new UnauthorizedException('Пользователь заблокирован или удалён');
    }

    return storedToken;
  }

  private hashRefreshToken(refreshToken: string): string {
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');

    return createHmac('sha256', refreshSecret)
      .update(refreshToken)
      .digest('hex');
  }

  private getTokenExpiresIn(name: string, defaultSeconds: number): number {
    const value = this.configService.get<string>(name);

    if (!value) {
      return defaultSeconds;
    }

    return parseDurationToSeconds(value, defaultSeconds);
  }

  private getRequiredConfig(name: string): string {
    const value = this.configService.get<string>(name);

    if (!value) {
      throw new Error(`Missing required config: ${name}`);
    }

    return value;
  }

  async verifyAccessToken(accessToken: string): Promise<JwtAccessPayload> {
    const accessSecret = this.getRequiredConfig('JWT_ACCESS_SECRET');
    
    let payload: JwtAccessPayload;
    
    try {
      payload = await this.jwtService.verifyAsync<JwtAccessPayload>(
        accessToken,
        {
          secret: accessSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Некорректный или истёкший access token');
    }
  
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Некорректный тип токена');
    }
  
    return payload;
  }
}