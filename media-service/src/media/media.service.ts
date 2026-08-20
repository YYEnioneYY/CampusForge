import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { StorageService } from '../storage/storage.service';

import {
  CreateProfileAvatarUploadDto,
} from './dto/create-profile-avatar-upload.dto';

import {
  MediaRepository,
} from './media.repository';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository:
      MediaRepository,

    private readonly storageService:
      StorageService,

    private readonly configService:
      ConfigService,
  ) {}

  async createProfileAvatarUpload(
    dto: CreateProfileAvatarUploadDto,
  ) {
    const mediaId = randomUUID();

    const objectKey =
      `profile-avatars/${mediaId}.webp`;

    const expiresInSeconds =
      this.configService.getOrThrow<number>(
        'S3_UPLOAD_URL_EXPIRES_IN',
      );

    const expiresAt = new Date(
      Date.now() +
        expiresInSeconds * 1000,
    );

    await this.mediaRepository
      .expirePendingProfileAvatars(
        dto.userId,
      );

    const mediaFile =
      await this.mediaRepository
        .createPendingProfileAvatar({
          id: mediaId,
          userId: dto.userId,
          objectKey,
          expiresAt,
        });

    try {
      const uploadUrl =
        await this.storageService
          .createUploadUrl(
            objectKey,
            'image/webp',
          );

      return {
        uploadUrl,
        expiresAt:
          mediaFile.expiresAt
            ?.toISOString() ?? null,
      };
    } catch (error) {
      await this.mediaRepository
        .deleteById(mediaId);

      throw error;
    }
  }
}