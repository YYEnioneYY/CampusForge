import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SystemRole,
  UserStatus,
} from '../generated/prisma/client';
import { CreateUserInput } from './types/create-user.input';
import { GetUsersPageInput } from './types/get-users-page.input';
import {
  AdminUserRecord,
  UsersRepository,
} from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async createUser(input: CreateUserInput) {
    return this.usersRepository.createUser({
      email: input.email,
      passwordHash: input.passwordHash,
      systemRole: SystemRole.USER,
      status: UserStatus.PENDING,
    });
  }

  async findByEmailForAuth(email: string) {
    return this.usersRepository.findByEmailForAuth(email);
  }

  async findByIdForEmailVerification(userId: string) {
    return this.usersRepository.findByIdForEmailVerification(userId);
  }

  async findMeById(userId: string) {
    return this.usersRepository.findMeById(userId);
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    await this.usersRepository.updateLastLoginAt(userId);
  }

  async activateAfterEmailVerification(
    userId: string,
    verifiedAt: Date,
    tx: Prisma.TransactionClient,
  ) {
    return this.usersRepository.activateAfterEmailVerification(
      userId,
      verifiedAt,
      tx,
    );
  }

  async findByEmailForPasswordReset(email: string) {
    return this.usersRepository.findByEmailForPasswordReset(email);
  }

  async findByIdForPasswordChange(userId: string) {
    return this.usersRepository.findByIdForPasswordChange(userId);
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    tx: Prisma.TransactionClient,
  ) {
    return this.usersRepository.updatePassword(
      userId,
      passwordHash,
      tx,
    );
  }

  async getUsersPage(input: GetUsersPageInput) {
    const safePage = Math.max(input.page ?? 1, 1);
    const safeLimit = Math.min(
      Math.max(input.limit ?? 20, 1),
      100,
    );

    const normalizedSearch = input.search?.trim() || undefined;

    const { total, users } =
      await this.usersRepository.findUsersPage({
        page: safePage,
        limit: safeLimit,
        search: normalizedSearch,
        status: input.status,
        role: input.role,
      });

    const totalPages = Math.ceil(total / safeLimit);

    return {
      items: users.map((user) =>
        this.mapUserForAdminResponse(user),
      ),

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
    return this.usersRepository.findByIdForAdminCheck(userId);
  }

  async findByIdForAdminAction(userId: string) {
    return this.usersRepository.findByIdForAdminAction(userId);
  }

  async updateUserStatusInTransaction(
    userId: string,
    status: UserStatus,
    tx: Prisma.TransactionClient,
  ) {
    return this.usersRepository.updateUserStatusInTransaction(
      userId, 
      status, 
      tx,
    );
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
  ) {
    return this.usersRepository.updateUserStatus(
      userId,
      status,
    );
  }

  mapUserForAdminResponse(user: AdminUserRecord) {
    return {
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
    };
  }
}