import { Injectable } from '@nestjs/common';

import { 
  Prisma,
  ProfileVisibility,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProfileData } from './types/create-profile-data.type';
import { throwRpcError } from 'src/common/rpc/throw-rpc-error';
import { RpcErrorCode } from 'src/common/rpc/rpc-error-code';

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

const profileByUsernameSelect = {
  userId: true,

  username: true,

  firstName: true,
  lastName: true,
  middleName: true,

  avatarId: true,

  bio: true,

  countryCode: true,
  countryName: true,

  visibility: true,
} as const;

const searchProfileSelect = {
  userId: true,

  username: true,

  firstName: true,
  lastName: true,
  middleName: true,

  avatarId: true,

  visibility: true,
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
    return this.prisma.userProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
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
    return this.prisma.$transaction(async (tx) => {
      const currentProfile = await tx.userProfile.findUnique({
        where: { userId },

        select: { 
          username: true,
          usernameChangedAt: true,
        }   
      });

      if(!currentProfile) {
        throwRpcError(
          RpcErrorCode.PROFILE_NOT_FOUND,
          "Profile not found"
        )
      }

      if (currentProfile.username === username) {
        throwRpcError(
          RpcErrorCode.USERNAME_SAME_AS_CURRENT,
          'New username must be different from current username',
        );
      }

      if(currentProfile.usernameChangedAt) {
        const cooldownMs = 30 * 24 * 60 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(currentProfile.usernameChangedAt).getTime();

        if (timeElapsed < cooldownMs) {
          const daysLeft = Math.ceil((cooldownMs - timeElapsed) / (1000 * 60 * 60 * 24));
          throwRpcError(
            RpcErrorCode.USERNAME_CHANGE_TIMEOUT,
            `You can change your username only once every 30 days. Try again in ${daysLeft} days.`
          );
        }
      }

      return await tx.userProfile.update({
        where: { userId },
        data: {
          username: username,
          previousUsername: currentProfile.username,
          usernameChangedAt: new Date(),
        },
        select: { username: true }
      });
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

  async searchProfiles(
    query: string,
    page: number,
    limit: number,
  ) {
    const terms = query
      .split(/\s+/)
      .filter(Boolean);
  
    const where = {
      deletedAt: null,

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
    } satisfies Prisma.UserProfileWhereInput;
  
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

  async findByUsername(
    username: string,
  ) {
    return this.prisma.userProfile.findFirst({
      where: {
        username,
        deletedAt: null,
      },
  
      select:
        profileByUsernameSelect,
    });
  }

  async clearAvatarIfCurrent(
    userId: string,
    avatarId: string,
  ): Promise<void> {
    await this.prisma.userProfile.updateMany({
      where: {
        userId,
        avatarId,
      },
  
      data: {
        avatarId: null,
      },
    });
  }

  async findSummariesByUserIds(
    userIds: string[],
  ) {
    return this.prisma.userProfile.findMany({
      where: {
        userId: {
          in: userIds,
        },

        deletedAt: null,
      },
  
      select:
        searchProfileSelect,
    });
  }

  async softDeleteByUserId(
    userId: string,
    deletedAt: Date,
  ): Promise<void> {
    await this.prisma.userProfile.updateMany({
      where: {
        userId,
        deletedAt: null,
      },

      data: {
        deletedAt,
      },
    });
  }

  async restoreByUserId(
    userId: string,
  ): Promise<void> {
    await this.prisma.userProfile.updateMany({
      where: {
        userId,

        deletedAt: {
          not: null,
        },
      },

      data: {
        deletedAt: null,
      },
    });
  }
}