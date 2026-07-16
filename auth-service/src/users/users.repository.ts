import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SystemRole,
  UserStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const userSummarySelect = {
  id: true,
  email: true,
  systemRole: true,
  status: true,
  emailVerifiedAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const userForAuthSelect = {
  id: true,
  email: true,
  passwordHash: true,
  systemRole: true,
  status: true,
  emailVerifiedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const adminUserSelect = {
  id: true,
  email: true,
  systemRole: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type AdminUserRecord = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

type CreateUserRecordInput = {
  email: string;
  passwordHash: string;
  systemRole: SystemRole;
  status: UserStatus;
};

type FindUsersPageInput = {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus;
  role?: SystemRole;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async createUser(input: CreateUserRecordInput) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        systemRole: input.systemRole,
        status: input.status,
      },
      select: userSummarySelect,
    });
  }

  async findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: userForAuthSelect,
    });
  }

  async findByIdForEmailVerification(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        deletedAt: true,
      },
    });
  }

  async findMeById(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async activateAfterEmailVerification(
    userId: string,
    verifiedAt: Date,
    tx: Prisma.TransactionClient,
  ) {
    return tx.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerifiedAt: verifiedAt,
        status: UserStatus.ACTIVE,
      },
      select: userSummarySelect,
    });
  }

  async findByEmailForPasswordReset(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        status: true,
        deletedAt: true,
      },
    });
  }

  async findByIdForSensitiveAction(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
        deletedAt: true,
      },
    });
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash,
      },
      select: userSummarySelect,
    });
  }

  async softDeleteInTransaction(
    userId: string,
    deletedAt: Date,
    tx: Prisma.TransactionClient,
  ) {
    return tx.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.DELETED,
        deletedAt,
      },
      select: adminUserSelect,
    });
  }

  async findByEmailForAccountRestore(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        deletedAt: true,
      },
    });
  }

  async restoreUserInTransaction(
    userId: string,
    status: UserStatus,
    tx: Prisma.TransactionClient,
  ) {
    return tx.user.update({
      where: {
        id: userId,
      },
      data: {
        status,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Админские функции
  async findUsersPage(input: FindUsersPageInput) {
    const where: Prisma.UserWhereInput = {
      ...(input.status !== undefined
        ? {
            status: input.status,
          }
        : {}),

      ...(input.role !== undefined
        ? {
            systemRole: input.role,
          }
        : {}),

      ...(input.search
        ? {
            email: {
              contains: input.search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const skip = (input.page - 1) * input.limit;

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({
        where,
      }),

      this.prisma.user.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: input.limit,
        select: adminUserSelect,
      }),
    ]);

    return {
      total,
      users,
    };
  }

  async findByIdForAdminCheck(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        systemRole: true,
        status: true,
        deletedAt: true,
      },
    });
  }

  async findByIdForAdminAction(
    userId: string,
  ): Promise<AdminUserRecord | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: adminUserSelect,
    });
  }

  // Универсальные способы для обновления статуса(без транзакции и с транзакцией)
  async updateUserStatus(
    userId: string,
    status: UserStatus,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status,
      },
      select: adminUserSelect,
    });
  }

  async updateUserStatusInTransaction(
    userId: string,
    status: UserStatus,
    tx: Prisma.TransactionClient,
  ): Promise<AdminUserRecord> {
    return tx.user.update({
      where: {
        id: userId,
      },
      data: {
        status,
      },
      select: adminUserSelect,
    });
  }
}