import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefreshTokenSessionInput } from './types/create-refresh-token-session.input';
import { FindActiveRefreshTokenSessionInput } from './types/find-active-refresh-token-session.input';
import { RotateRefreshTokenSessionInput } from './types/rotate-refresh-token-session.input';
import { GetUserSessionsInput } from './types/get-user-sessions.input';

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
        deviceName: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            systemRole: true,
            status: true,
            emailVerifiedAt: true,
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
  
    if (!this.areHashesEqual(token.tokenHash, tokenHash)) {
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

  async rotateSession(input: RotateRefreshTokenSessionInput) {
    const tokenHash = this.hashToken(input.newSession.refreshToken);
    
    return this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: {
          id: input.oldSessionId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    
      return tx.refreshToken.create({
        data: {
          id: input.newSession.id,
          userId: input.newSession.userId,
          tokenHash,
          deviceName: input.newSession.deviceName,
          ipAddress: input.newSession.ipAddress,
          userAgent: input.newSession.userAgent,
          expiresAt: input.newSession.expiresAt,
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
    });
  }

  async revokeUserSession(userId: string, sessionId: string): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count > 0;
  }

  async getUserSessions(input: GetUserSessionsInput) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId: input.userId,
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
      ...session,
      isCurrent: input.currentSessionId
        ? session.id === input.currentSessionId
        : false,
    }));
  }

  async revokeAllUserTokensInTransaction(
    userId: string,
    revokedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const result = await tx.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    return result.count;
  }

  private areHashesEqual(firstHash: string, secondHash: string): boolean {
    const firstBuffer = Buffer.from(firstHash, 'hex');
    const secondBuffer = Buffer.from(secondHash, 'hex');

    if (firstBuffer.length !== secondBuffer.length) {
      return false;
    }

    return timingSafeEqual(firstBuffer, secondBuffer);
  }
}
