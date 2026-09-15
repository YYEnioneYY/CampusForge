import { Injectable } from '@nestjs/common';

import { 
  Prisma,
  ProfileVisibility,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProfileData } from './types/create-profile-data.type';

const profileSelect = {
  id: true,
  userId: true,

  username: true,

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

const searchProfileSelect = {
  userId: true,

  username: true,

  firstName: true,
  lastName: true,
  middleName: true,

  avatarId: true,
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
    data: CreateProfileData,
  ) {
    return this.prisma.userProfile.upsert({
      where: {
        userId: data.userId,
      },

      create: {
        userId: data.userId,

        username:
          data.username,

        firstName:
          data.firstName,

        lastName:
          data.lastName,

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

  async updateUsername(
    userId: string,
    username: string,
  ) {
    return this.prisma.userProfile.update({
      where: {
        userId,
      },

      data: {
        username,
      },

      select: {
        username: true,
      },
    });
  }

  async updateVisibility(
    userId: string,
    visibility: ProfileVisibility,
  ) {
    return this.prisma.userProfile.update({
      where: {
        userId,
      },

      data: {
        visibility,
      },

      select: {
        visibility: true,
      },
    });
  }

  async searchPublicProfiles(
    query: string,
    page: number,
    limit: number,
  ) {
    const terms = query
      .split(/\s+/)
      .filter(Boolean);
  
    const where:
      Prisma.UserProfileWhereInput = {
        visibility:
          ProfileVisibility.PUBLIC,
  
        AND: terms.map((term) => ({
          OR: [
            {
              username: {
                contains: term,
                mode: 'insensitive',
              },
            },
  
            {
              firstName: {
                contains: term,
                mode: 'insensitive',
              },
            },
  
            {
              lastName: {
                contains: term,
                mode: 'insensitive',
              },
            },
  
            {
              middleName: {
                contains: term,
                mode: 'insensitive',
              },
            },
          ],
        })),
      };
  
    const [profiles, total] =
      await this.prisma.$transaction([
        this.prisma.userProfile.findMany({
          where,
  
          select: searchProfileSelect,
  
          orderBy: {
            username: 'asc',
          },
  
          skip:
            (page - 1) * limit,
  
          take: limit,
        }),
  
        this.prisma.userProfile.count({
          where,
        }),
      ]);
  
    return {
      profiles,
      total,
    };
  }
}