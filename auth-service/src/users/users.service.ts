import { Injectable } from '@nestjs/common';
import { UserStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
  email: string;
  phone?: string | null;
  passwordHash: string;
};

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
}