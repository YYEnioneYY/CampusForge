import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const refreshTokenSessionSelect = {
  id: true,
  userId: true,
  deviceName: true,
  sessionName: true,
  ipAddress: true,
  userAgent: true,
  expiresAt: true,
  revokedAt: true,
  createdAt: true,
} satisfies Prisma.RefreshTokenSelect;

const refreshTokenWithUserSelect = {
  id: true,
  userId: true,
  tokenHash: true,
  deviceName: true,
  sessionName: true,
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
      createdAt: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.RefreshTokenSelect;

const userSessionSelect = {
  id: true,
  deviceName: true,
  sessionName: true,
  ipAddress: true,
  userAgent: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.RefreshTokenSelect;

export type UserSessionRecord =
  Prisma.RefreshTokenGetPayload<{
    select: typeof userSessionSelect;
  }>;

export type RefreshTokenWithUserRecord =
  Prisma.RefreshTokenGetPayload<{
    select: typeof refreshTokenWithUserSelect;
  }>;

export type RefreshSessionRecord =
  Prisma.RefreshTokenGetPayload<{
    select: typeof refreshTokenSessionSelect;
  }>;

type CreateRefreshTokenRecordInput = {
  id: string;
  userId: string;
  tokenHash: string;
  deviceName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
};

type RotateRefreshTokenRecordInput = {
  oldSessionId: string;
  rotatedAt: Date;
  newSession: CreateRefreshTokenRecordInput;
};

type RenameActiveSessionInput = {
  userId: string;
  sessionId: string;
  sessionName: string;
  now: Date;
};

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(input: CreateRefreshTokenRecordInput) {
    return this.prisma.refreshToken.create({
      data: {
        id: input.id,
        userId: input.userId,
        tokenHash: input.tokenHash,
        deviceName: input.deviceName,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt: input.expiresAt,
      },
      select: refreshTokenSessionSelect,
    });
  }

  async findByIdWithUser(
    id: string,
  ): Promise<RefreshTokenWithUserRecord | null> {
    return this.prisma.refreshToken.findUnique({
      where: {
        id,
      },
      select: refreshTokenWithUserSelect,
    });
  }

  async revokeById(id: string, revokedAt: Date): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    return result.count;
  }

  async revokeAllByUserId(
    userId: string,
    revokedAt: Date,
  ): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
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

  async revokeAllExcept(
    userId: string,
    exceptSessionId: string,
    revokedAt: Date,
  ): Promise<string[]> {
    return this.prisma.$transaction(async (tx) => {
      const sessions = await tx.refreshToken.findMany({
        where: {
          userId,
          id: {
            not: exceptSessionId,
          },
          revokedAt: null,
        },
        select: {
          id: true,
        },
      });
  
      const sessionIds = sessions.map((session) => session.id);
  
      if (sessionIds.length === 0) {
        return [];
      }
  
      await tx.refreshToken.updateMany({
        where: {
          id: {
            in: sessionIds,
          },
          revokedAt: null,
        },
        data: {
          revokedAt,
        },
      });
  
      return sessionIds;
    });
  }

  async revokeUserSession(
    userId: string,
    sessionId: string,
    revokedAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    return result.count > 0;
  }

  async findActiveUserSessions(userId: string, now: Date) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: userSessionSelect,
    });
  }

  async rotateSession(
    input: RotateRefreshTokenRecordInput,
  ): Promise<RefreshSessionRecord | null> {
    return this.prisma.$transaction(async (tx) => {
      const oldSession =
        await tx.refreshToken.findUnique({
          where: {
            id: input.oldSessionId,
          },
          select: {
            userId: true,
            deviceName: true,
            sessionName: true,
            ipAddress: true,
            userAgent: true,
          },
        });

      if (!oldSession) {
        return null;
      }

      if (
        oldSession.userId !==
        input.newSession.userId
      ) {
        return null;
      }

      const revokeResult =
        await tx.refreshToken.updateMany({
          where: {
            id: input.oldSessionId,
            userId: input.newSession.userId,
            revokedAt: null,
            expiresAt: {
              gt: input.rotatedAt,
            },
          },
          data: {
            revokedAt: input.rotatedAt,
          },
        });

      if (revokeResult.count !== 1) {
        return null;
      }

      return tx.refreshToken.create({
        data: {
          id: input.newSession.id,
          userId: input.newSession.userId,
          tokenHash: input.newSession.tokenHash,

          deviceName:
            input.newSession.deviceName ??
            oldSession.deviceName,

          sessionName:
            oldSession.sessionName,

          ipAddress:
            input.newSession.ipAddress ??
            oldSession.ipAddress,

          userAgent:
            input.newSession.userAgent ??
            oldSession.userAgent,

          expiresAt: input.newSession.expiresAt,
        },
        select: refreshTokenSessionSelect,
      });
    });
  }

  async revokeAllInTransaction(
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

  async revokeAllExceptInTransaction(
    userId: string,
    exceptSessionId: string,
    revokedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<string[]> {
    const sessions = await tx.refreshToken.findMany({
      where: {
        userId,
        id: {
          not: exceptSessionId,
        },
        revokedAt: null,
      },
      select: {
        id: true,
      },
    });

    const sessionIds = sessions.map((session) => session.id);

    if (sessionIds.length === 0) {
      return [];
    }

    await tx.refreshToken.updateMany({
      where: {
        id: {
          in: sessionIds,
        },
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    return sessionIds;
  }

  async renameActiveSession(
    input: RenameActiveSessionInput,
  ): Promise<UserSessionRecord | null> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.refreshToken.updateMany({
        where: {
          id: input.sessionId,
          userId: input.userId,
          revokedAt: null,
          expiresAt: {
            gt: input.now,
          },
        },
        data: {
          sessionName: input.sessionName,
        },
      });

      if (result.count !== 1) {
        return null;
      }

      return tx.refreshToken.findUnique({
        where: {
          id: input.sessionId,
        },
        select: userSessionSelect,
      });
    });
  }

  async deleteExpiredTokens(now: Date): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return result.count;
  }
}