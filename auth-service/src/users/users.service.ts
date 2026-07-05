import { Injectable } from '@nestjs/common';
import { Prisma, SystemRole, UserStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './types/create-user.input';

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
        phone: input.phone,
        passwordHash: input.passwordHash,
        SystemRole: SystemRole.USER,
        status: UserStatus.PENDING,
      },
      select: {
        id: true,
        email: true,
        phone: true,
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
        phone: true,
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
        phone: true,
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

  async updatePasswordAfterReset(
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
        phone: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }
}