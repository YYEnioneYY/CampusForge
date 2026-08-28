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
import { CreateAvatarUploadResponseDto } from './dto/create-avatar-upload-response.dto';

import { ChangeUsernameResponseDto } from './dto/change-username-response.dto';
import { ChangeUsernamePayload } from './types/change-username.types';
import { ChangeUsernameResponse } from './types/change-username.types';

import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateMyProfileResponseDto } from './dto/update-my-profile-response.dto';
import type {
  UpdateMyProfilePayload,
  UpdateMyProfileResponse,
} from './types/update-my-profile.types';

import { ProfileVisibilityOptionsResponseDto } from './dto/profile-visibility-options-response.dto';
import type { ProfileVisibilityOptionsResponse } from './types/profile-visibility-options.types';
import { ChangeProfileVisibilityPayload } from './types/change-profile-visibility.types';
import { ChangeProfileVisibilityResponse } from './types/change-profile-visibility.types';
import { ChangeProfileVisibilityResponseDto } from './dto/change-profile-visibility-response.dto';

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

  async changeUsername(
    userId: string,
    username: string,
  ): Promise<ChangeUsernameResponseDto> {
    const payload:
      ChangeUsernamePayload = {
        userId,
        username,
      };
  
    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          ChangeUsernameResponse,
          ChangeUsernamePayload
        >(
          PROFILE_PATTERNS.CHANGE_USERNAME,
          payload,
        ),
      );
  
    return {
      username:
        result.username,
    };
  }

  async createAvatarUpload(
    userId: string,
  ): Promise<CreateAvatarUploadResponseDto> {
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

  async updateMyProfile(
    userId: string,
    dto: UpdateMyProfileDto,
  ): Promise<UpdateMyProfileResponseDto> {
    const payload:
      UpdateMyProfilePayload = {
        userId,
      
        firstName:
          dto.firstName,
      
        lastName:
          dto.lastName,
      
        middleName:
          dto.middleName,
      
        bio:
          dto.bio,
      
        countryCode:
          dto.countryCode,
      
        dateOfBirth:
          dto.dateOfBirth,
      };
  
    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          UpdateMyProfileResponse,
          UpdateMyProfilePayload
        >(
          PROFILE_PATTERNS.UPDATE_ME,
          payload,
        ),
      );
  
    return {
      profile: {
        username:
          result.profile.username,
      
        firstName:
          result.profile.firstName,
      
        lastName:
          result.profile.lastName,
      
        middleName:
          result.profile.middleName,
      
        bio:
          result.profile.bio,
      
        countryCode:
          result.profile.countryCode,
      
        countryName:
          result.profile.countryName,
      
        dateOfBirth:
          result.profile.dateOfBirth,
      
        visibility:
          result.profile.visibility,
      },
    };
  }

  async getVisibilityOptions(): Promise<ProfileVisibilityOptionsResponseDto> {
    const result =
      await firstValueFrom(this.profileKafkaService.send<
          ProfileVisibilityOptionsResponse,
          Record<string, never>
        >(
          PROFILE_PATTERNS.VISIBILITY_OPTIONS,
          {},
        ),
      );
  
    return {
      options: result.options,
    };
  }

  async changeVisibility(
    userId: string,
    visibility: string,
  ): Promise<ChangeProfileVisibilityResponseDto> {
    const payload:
      ChangeProfileVisibilityPayload = {
        userId,
        visibility,
      };
  
    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          ChangeProfileVisibilityResponse,
          ChangeProfileVisibilityPayload
        >(
          PROFILE_PATTERNS.CHANGE_VISIBILITY,
          payload,
        ),
      );
  
    return {
      visibility:
        result.visibility,
    };
  }
}