import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefreshTokenSessionInput } from './types/create-refresh-token-session.input';
import { FindActiveRefreshTokenSessionInput } from './types/find-active-refresh-token-session.input';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(input: CreateRefreshTokenSessionInput) {
    const tokenHash = this.hashToken(input.refreshToken);

    return this.prisma.refreshToken.create({
      data: {
        id: input.id,
        userId: input.userId,
        tokenHash,
        deviceName: input.deviceName,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt: input.expiresAt,
      },
      select: {
        id: true,
        userId: true,
        deviceName: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
  }

  async findActiveSession(input: FindActiveRefreshTokenSessionInput) {
    const tokenHash = this.hashToken(input.refreshToken);
  
    const token = await this.prisma.refreshToken.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            systemRole: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });
  
    if (!token) {
      return null;
    }
  
    if (token.userId !== input.userId) {
      return null;
    }
  
    if (token.tokenHash !== tokenHash) {
      return null;
    }
  
    if (!this.isActive(token)) {
      return null;
    }
  
    return token;
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  
    return result.count;
  }

  private hashToken(token: string): string {
    const secret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_HASH_SECRET',
    );

    return createHmac('sha256', secret).update(token).digest('hex');
  }

  private isActive(token: {
    expiresAt: Date;
    revokedAt: Date | null;
  }): boolean {
    return token.revokedAt === null && token.expiresAt > new Date();
  }

  async revokeAllUserTokensExcept(
    userId: string,
    exceptTokenId: string,
  ): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        id: {
          not: exceptTokenId,
        },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
