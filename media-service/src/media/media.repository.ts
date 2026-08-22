import { Injectable } from '@nestjs/common';

import {
  MediaOwnerType,
  MediaPurpose,
  MediaStatus,
} from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type CreatePendingProfileAvatarData = {
  id: string;
  userId: string;
  objectKey: string;
  expiresAt: Date;
};

@Injectable()
export class MediaRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async expirePendingProfileAvatars(
    userId: string,
  ): Promise<void> {
    await this.prisma.mediaFile.updateMany({
      where: {
        ownerType: MediaOwnerType.USER,
        ownerId: userId,
        purpose:
          MediaPurpose.PROFILE_AVATAR,
        status: MediaStatus.PENDING,
      },

      data: {
        status: MediaStatus.EXPIRED,
      },
    });
  }

  async createPendingProfileAvatar(
    data: CreatePendingProfileAvatarData,
  ) {
    return this.prisma.mediaFile.create({
      data: {
        id: data.id,

        ownerType: MediaOwnerType.USER,
        ownerId: data.userId,

        uploadedByUserId: data.userId,

        purpose:
          MediaPurpose.PROFILE_AVATAR,

        objectKey: data.objectKey,

        contentType: 'image/webp',

        status: MediaStatus.PENDING,

        expiresAt: data.expiresAt,
      },

      select: {
        id: true,
        objectKey: true,
        expiresAt: true,
      },
    });
  }

  async deleteById(
    id: string,
  ): Promise<void> {
    await this.prisma.mediaFile.delete({
      where: {
        id,
      },
    });
  }

  async findByObjectKey(
    objectKey: string,
  ) {
    return this.prisma.mediaFile.findUnique({
      where: {
        objectKey,
      },
  
      select: {
        id: true,
  
        ownerType: true,
        ownerId: true,
  
        purpose: true,
  
        objectKey: true,
        contentType: true,
  
        status: true,
        expiresAt: true,
      },
    });
  }

  async markReadyIfPending(
    objectKey: string,
    sizeBytes: bigint,
  ) {
    const now = new Date();
  
    const result =
      await this.prisma.mediaFile.updateMany({
        where: {
          objectKey,
  
          status:
            MediaStatus.PENDING,
  
          expiresAt: {
            gt: now,
          },
        },
  
        data: {
          status:
            MediaStatus.READY,
  
          sizeBytes,
  
          completedAt: now,
          expiresAt: null,
        },
      });
  
    if (result.count === 0) {
      return null;
    }
  
    return this.prisma.mediaFile.findUnique({
      where: {
        objectKey,
      },
  
      select: {
        id: true,
  
        ownerType: true,
        ownerId: true,
  
        purpose: true,
  
        objectKey: true,
  
        status: true,
      },
    });
  }
}