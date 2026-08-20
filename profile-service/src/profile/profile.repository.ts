import { Injectable } from '@nestjs/common';

import { ProfileVisibility } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateUserProfileDto } from './dto/create-user-profile.dto';

const profileSelect = {
  id: true,
  userId: true,

  firstName: true,
  lastName: true,
  middleName: true,

  avatarId: true,
  bio: true,

  countryCode: true,
  countryName: true,

  dateOfBirth: true,

  visibility: true,

  createdAt: true,
  updatedAt: true,
} as const;

export type UpdateProfileData = {
  firstName?: string;
  lastName?: string;

  middleName?: string | null;

  avatarId?: string | null;
  bio?: string | null;

  countryCode?: string | null;
  countryName?: string | null;

  dateOfBirth?: Date | null;

  visibility?: ProfileVisibility;
};

export type ProfileRecord =
  Awaited<
    ReturnType<
      ProfileRepository['updateByUserId']
    >
  >;

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createForUser(
    dto: CreateUserProfileDto,
  ) {
    return this.prisma.userProfile.upsert({
      where: {
        userId: dto.userId,
      },

      create: {
        userId: dto.userId,

        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName ?? null,

        visibility:
          ProfileVisibility.PUBLIC,
      },

      update: {},

      select: profileSelect,
    });
  }

  async findByUserId(
    userId: string,
  ) {
    return this.prisma.userProfile.findUnique({
      where: {
        userId,
      },

      select: profileSelect,
    });
  }

  async updateByUserId(
    userId: string,
    data: UpdateProfileData,
  ) {
    return this.prisma.userProfile.update({
      where: {
        userId,
      },

      data,

      select: profileSelect,
    });
  }
}