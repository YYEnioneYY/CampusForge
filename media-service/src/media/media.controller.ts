import { Controller } from '@nestjs/common';

import {
  MessagePattern,
  EventPattern,
  Payload,
} from '@nestjs/microservices';

import {
  MEDIA_PATTERNS,
} from '../kafka/patterns/media-patterns';

import { STORAGE_PATTERNS } from 'src/kafka/patterns/storage-patterns';

import {
  CreateProfileAvatarUploadDto,
} from './dto/create-profile-avatar-upload.dto';

import {
  MediaService,
} from './media.service';

import type { MinioObjectCreatedEvent } from 'src/storage/types/minio-object-created-event.type';

@Controller()
export class MediaController {
  constructor(
    private readonly mediaService:
      MediaService,
  ) {}

  @MessagePattern(MEDIA_PATTERNS.CREATE_PROFILE_AVATAR_UPLOAD)
  createProfileAvatarUpload(
    @Payload()
    dto: CreateProfileAvatarUploadDto,
  ) {
    return this.mediaService.createProfileAvatarUpload(dto);
  }

  @EventPattern(STORAGE_PATTERNS.OBJECT_CREATED)
  async handleObjectCreated(
    @Payload()
    event: MinioObjectCreatedEvent,
  ): Promise<void> {
    await this.mediaService.handleObjectCreated(event);
  }
}