import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { StorageService } from '../storage/storage.service';

import {
  CreateProfileAvatarUploadDto,
} from './dto/create-profile-avatar-upload.dto';

import {
  MediaRepository,
} from './media.repository';

import {
  MediaEventProducerService,
} from '../media-event-producer/media-event-producer.service';

import { MinioObjectCreatedEvent } from 'src/storage/types/minio-object-created-event.type';
import { MediaStatus } from '../generated/prisma/enums';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(
    MediaService.name,
  );

  constructor(
    private readonly mediaRepository:
      MediaRepository,

    private readonly storageService:
      StorageService,

    private readonly configService:
      ConfigService,

    private readonly mediaEventProducerService:
      MediaEventProducerService,
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

  async handleObjectCreated(
    event: MinioObjectCreatedEvent,
  ): Promise<void> {
    const records = event.Records ?? [];
  
    for (const record of records) {
      if (
        record.eventName !==
        's3:ObjectCreated:Put'
      ) {
        continue;
      }
  
      const bucket =
        record.s3.bucket.name;
  
      const objectKey =
        decodeURIComponent(
          record.s3.object.key,
        );
  
      if (
        bucket !==
        this.storageService.bucket
      ) {
        continue;
      }
  
      const mediaFile =
        await this.mediaRepository
          .findByObjectKey(objectKey);
  
      if (!mediaFile) {
        this.logger.warn(
          `Media file not found for object: ${objectKey}`,
        );
  
        continue;
      }
  
      if (
        mediaFile.status !==
        MediaStatus.PENDING
      ) {
        return;
      }
  
      if (
        mediaFile.expiresAt &&
        mediaFile.expiresAt <= new Date()
      ) {
        this.logger.warn(
          `Expired upload received: ${objectKey}`,
        );
  
        return;
      }
  
      const object =
        await this.storageService
          .headObject(objectKey);
  
      if (
        object.ContentType !==
        mediaFile.contentType
      ) {
        this.logger.warn(
          `Invalid content type for ${objectKey}`,
        );
  
        return;
      }
  
      if (
        object.ContentLength === undefined
      ) {
        this.logger.warn(
          `Object size is missing for ${objectKey}`,
        );
  
        return;
      }
  
      const readyMedia =
        await this.mediaRepository
          .markReadyIfPending(
            objectKey,
            BigInt(object.ContentLength),
          );
  
      if (!readyMedia) {
        return;
      }
  
      await this.mediaEventProducerService.emitFileReady({
        mediaId:
          readyMedia.id,
      
        ownerType:
          'user',
      
        ownerId:
          readyMedia.ownerId,
      
        purpose:
          'profile_avatar',
      });
    }
  }
}