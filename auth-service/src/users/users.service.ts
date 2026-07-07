import { Injectable } from '@nestjs/common';
import { Prisma, SystemRole, UserStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './types/create-user.input';
import { GetUsersPageInput } from './types/get-users-page.input';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        SystemRole: SystemRole.USER,
        status: UserStatus.PENDING,
      },
      select: {
        id: true,
        email: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  async findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
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
      where: { id: userId },
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
      select: {
        id: true,
        email: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
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

  async findByIdForPasswordChange(userId: string) {
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
      select: {
        id: true,
        email: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  async getUsersPage(input: GetUsersPageInput) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const search = input.search?.trim();

    const where: Prisma.UserWhereInput = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.role ? { systemRole: input.role } : {}),
      ...(search
        ? {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const skip = (safePage - 1) * safeLimit;

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
        take: safeLimit,
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
      }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.systemRole,
        status: user.status,
        emailVerified: Boolean(user.emailVerifiedAt),
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        deletedAt: user.deletedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
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
}