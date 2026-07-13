import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const verificationTokenWithUserSelect = {
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
} satisfies Prisma.EmailVerificationTokenSelect;

type CreateVerificationTokenRecordInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
};

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestCreatedAtByUserId(
    userId: string,
  ): Promise<Date | null> {
    const token = await this.prisma.emailVerificationToken.findFirst({
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

  async invalidateActiveTokensAndCreate(
    input: CreateVerificationTokenRecordInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: {
          userId: input.userId,
          usedAt: null,
        },
        data: {
          usedAt: input.createdAt,
        },
      });

      return tx.emailVerificationToken.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          createdAt: true,
        },
      });
    });
  }

  async findByTokenHash(tokenHash: string) {
    return this.prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
      select: verificationTokenWithUserSelect,
    });
  }

  async markAsUsedIfActiveInTransaction(
    tokenId: string,
    usedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const result = await tx.emailVerificationToken.updateMany({
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

    return result.count > 0;
  }

  async deleteExpiredAndOldUsedTokens(
    now: Date,
    usedBefore: Date,
  ): Promise<number> {
    const result = await this.prisma.emailVerificationToken.deleteMany({
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