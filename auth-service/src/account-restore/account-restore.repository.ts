import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const accountRestoreTokenWithUserSelect = {
  id: true,
  userId: true,
  expiresAt: true,
  usedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.AccountRestoreTokenSelect;

export type AccountRestoreTokenWithUser =
  Prisma.AccountRestoreTokenGetPayload<{
    select: typeof accountRestoreTokenWithUserSelect;
  }>;

type CreateAccountRestoreTokenInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  invalidatedAt: Date;
};

@Injectable()
export class AccountRestoreRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findLatestCreatedAtByUserId(
    userId: string,
  ): Promise<Date | null> {
    const token =
      await this.prisma.accountRestoreToken.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      });

    return token?.createdAt ?? null;
  }

  async invalidateUnusedTokensAndCreate(
    input: CreateAccountRestoreTokenInput,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.accountRestoreToken.updateMany({
        where: {
          userId: input.userId,
          usedAt: null,
        },
        data: {
          usedAt: input.invalidatedAt,
        },
      });

      await tx.accountRestoreToken.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<AccountRestoreTokenWithUser | null> {
    return this.prisma.accountRestoreToken.findUnique({
      where: {
        tokenHash,
      },
      select: accountRestoreTokenWithUserSelect,
    });
  }

  async markAsUsedIfActiveInTransaction(
    tokenId: string,
    usedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const result =
      await tx.accountRestoreToken.updateMany({
        where: {
          id: tokenId,
          usedAt: null,
          expiresAt: {
            gt: usedAt,
          },
        },
        data: {
          usedAt,
        },
      });

    return result.count === 1;
  }

  async invalidateUnusedTokensForUserInTransaction(
    userId: string,
    usedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const result =
      await tx.accountRestoreToken.updateMany({
        where: {
          userId,
          usedAt: null,
        },
        data: {
          usedAt,
        },
      });

    return result.count;
  }

  async deleteExpiredAndOldUsedTokens(
    now: Date,
    usedBefore: Date,
  ): Promise<number> {
    const result =
      await this.prisma.accountRestoreToken.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: now,
              },
            },
            {
              usedAt: {
                lt: usedBefore,
              },
            },
          ],
        },
      });

    return result.count;
  }
}