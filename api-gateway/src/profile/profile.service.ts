import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  ProfileKafkaService,
} from '../kafka/profile-kafka.service';

import {
  PROFILE_PATTERNS,
} from '../kafka/patterns/profile-patterns';

import { MEDIA_PATTERNS } from 'src/kafka/patterns/media-patterns';

import type {
  GetMyProfilePayload,
} from './types/get-my-profile-payload.type';

import type {
  GetMyProfileResponse,
} from './types/get-my-profile-response.type';

import type {
  CreateProfileAvatarUploadPayload,
  CreateProfileAvatarUploadResponse,
} from './types/create-profile-avatar-upload.types';
import { MediaKafkaService } from 'src/kafka/media-kafka.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileKafkaService: ProfileKafkaService,
    private readonly mediaKafkaService: MediaKafkaService,
  ) {}

  async getMyProfile(
    userId: string,
  ): Promise<GetMyProfileResponse> {
    const payload: GetMyProfilePayload = {
      userId,
    };

    const result = await firstValueFrom(
      this.profileKafkaService.send<
        GetMyProfileResponse,
        GetMyProfilePayload
      >(
        PROFILE_PATTERNS.ME,
        payload,
      ),
    );

    return result;
  }

  async createAvatarUpload(
    userId: string,
  ): Promise<CreateProfileAvatarUploadResponse> {
    const payload: CreateProfileAvatarUploadPayload = {
      userId,
    };

    const result = await firstValueFrom(
      this.mediaKafkaService.send<
        CreateProfileAvatarUploadResponse,
        CreateProfileAvatarUploadPayload
      >(
        MEDIA_PATTERNS.CREATE_PROFILE_AVATAR_UPLOAD,
        payload,
      ),
    );
    
    return {
      uploadUrl: result.uploadUrl,
      expiresAt: result.expiresAt,
    };
  }
}