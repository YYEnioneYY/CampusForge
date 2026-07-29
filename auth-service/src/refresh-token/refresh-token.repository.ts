import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const refreshTokenSessionSelect = {
  id: true,
  userId: true,
  deviceId: true,
  deviceName: true,
  sessionName: true,
  ipAddress: true,
  userAgent: true,
  expiresAt: true,
  revokedAt: true,
  lastSeenAt: true,
  createdAt: true,
} satisfies Prisma.RefreshTokenSelect;

const refreshTokenWithUserSelect = {
  id: true,
  userId: true,
  tokenHash: true,
  deviceId: true,
  deviceName: true,
  sessionName: true,
  ipAddress: true,
  userAgent: true,
  expiresAt: true,
  revokedAt: true,
  lastSeenAt: true,
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
  lastSeenAt: true,
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
  deviceId?: string | null;
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

type TouchActiveSessionInput = {
  userId: string;
  sessionId: string;
  seenAt: Date;
  updateBefore: Date;
};

type CreateDeviceSessionResult = {
  session: RefreshSessionRecord;
  revokedSessionIds: string[];
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
        deviceId: input.deviceId,
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
        expiresAt: {
          gt: revokedAt,
        },
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

  async findActiveUserSessions(userId: string, now: Date): Promise<UserSessionRecord[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        lastSeenAt: 'desc',
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
            deviceId: true,
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

          deviceId:
            oldSession.deviceId ??
            input.newSession.deviceId ??
            null,

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
          lastSeenAt: input.rotatedAt,
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

  async touchActiveSession(
    input: TouchActiveSessionInput,
  ): Promise<boolean> {
    const result =
      await this.prisma.refreshToken.updateMany({
        where: {
          id: input.sessionId,
          userId: input.userId,
          revokedAt: null,
          expiresAt: {
            gt: input.seenAt,
          },
          lastSeenAt: {
            lt: input.updateBefore,
          },
        },
        data: {
          lastSeenAt: input.seenAt,
        },
      });

    return result.count === 1;
  }

  async countActiveUserSessions(
    userId: string,
    now: Date,
  ): Promise<number> {
    return this.prisma.refreshToken.count({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });
  }

  async replaceActiveDeviceSession(
    input: CreateRefreshTokenRecordInput,
  ): Promise<CreateDeviceSessionResult> {
    const now = new Date();
  
    return this.prisma.$transaction(async (tx) => {
      let revokedSessionIds: string[] = [];
    
      if (input.deviceId) {
        const activeSessions =
          await tx.refreshToken.findMany({
            where: {
              userId: input.userId,
              deviceId: input.deviceId,
              revokedAt: null,
              expiresAt: {
                gt: now,
              },
            },
            select: {
              id: true,
            },
          });
        
        revokedSessionIds =
          activeSessions.map(
            (session) => session.id,
          );
        
        if (revokedSessionIds.length > 0) {
          await tx.refreshToken.updateMany({
            where: {
              id: {
                in: revokedSessionIds,
              },
              userId: input.userId,
              revokedAt: null,
            },
            data: {
              revokedAt: now,
            },
          });
        }
      }
    
      const session =
        await tx.refreshToken.create({
          data: {
            id: input.id,
            userId: input.userId,
            tokenHash: input.tokenHash,
          
            deviceId:
              input.deviceId ?? null,
          
            deviceName:
              input.deviceName ?? null,
          
            ipAddress:
              input.ipAddress ?? null,
          
            userAgent:
              input.userAgent ?? null,
          
            expiresAt:
              input.expiresAt,
          
            lastSeenAt:
              now,
          },
          select: refreshTokenSessionSelect,
        });
      
      return {
        session,
        revokedSessionIds,
      };
    });
  }
}