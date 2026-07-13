import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const passwordResetTokenWithUserSelect = {
  id: true,
  userId: true,
  expiresAt: true,
  usedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      status: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.PasswordResetTokenSelect;

export type PasswordResetTokenWithUser = Prisma.PasswordResetTokenGetPayload<{
  select: typeof passwordResetTokenWithUserSelect;
}>;

type CreatePasswordResetTokenInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  invalidatedAt: Date;
};

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenWithUser | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: passwordResetTokenWithUserSelect,
    });
  }

  async findLatestCreatedAtByUserId(
    userId: string,
  ): Promise<Date | null> {
    const token = await this.prisma.passwordResetToken.findFirst({
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
    input: CreatePasswordResetTokenInput,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: {
          userId: input.userId,
          usedAt: null,
        },
        data: {
          usedAt: input.invalidatedAt,
        },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });
    });
  }

  async markAsUsedIfActiveInTransaction(
    tokenId: string,
    usedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const result = await tx.passwordResetToken.updateMany({
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
    const result = await tx.passwordResetToken.updateMany({
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
    const result = await this.prisma.passwordResetToken.deleteMany({
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