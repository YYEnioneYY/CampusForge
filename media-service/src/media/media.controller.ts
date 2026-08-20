import { Controller } from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  MEDIA_PATTERNS,
} from '../kafka/patterns/media-patterns';

import {
  CreateProfileAvatarUploadDto,
} from './dto/create-profile-avatar-upload.dto';

import {
  MediaService,
} from './media.service';

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
}