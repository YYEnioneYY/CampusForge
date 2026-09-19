import { Controller } from '@nestjs/common';
import { 
  MessagePattern,
  EventPattern, 
  Payload,
 } from '@nestjs/microservices';
import { PROFILE_PATTERNS } from '../kafka/patterns/profile-patterns';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { ProfileService } from './profile.service';

import { GetMyProfileDto } from './dto/get-my-profile.dto';
import { ProfileResponse } from './types/profile-response.type';

import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeUsernameResponse } from './types/change-username-response.type';

import type { ProfileVisibilityOptionsResponse } from './types/profile-visibility-options-response.type';

import { ChangeProfileVisibilityDto } from './dto/change-profile-visibility.dto';
import { ChangeProfileVisibilityResponse } from './types/change-profile-visibility-response.type';

import { MEDIA_EVENT_PATTERNS } from '../kafka/patterns/media-event-patterns';

import { MediaFileReadyDto } from './dto/media-file-ready.dto';

import { SearchProfilesDto } from './dto/search-profiles.dto';
import type { SearchProfilesResponse } from './types/search-profiles-response.type';

import { GetPublicProfileDto } from './dto/get-public-profile.dto';
import type { PublicProfileResponse } from './types/public-profile-response.type';

import { DeleteMyAvatarDto } from './dto/delete-my-avatar.dto';

@Controller()
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @EventPattern(PROFILE_PATTERNS.USER_REGISTERED)
  async createProfileAfterUserRegistered(
    @Payload() dto: CreateUserProfileDto,
  ): Promise<void> {
    await this.profileService.createForUser(dto);
  }

  @EventPattern(MEDIA_EVENT_PATTERNS.FILE_READY)
  async handleMediaFileReady(
    @Payload()
    dto: MediaFileReadyDto,
  ): Promise<void> {
    await this.profileService.handleMediaFileReady(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.ME)
  getMyProfile(
    @Payload()
    dto: GetMyProfileDto,
  ): Promise<ProfileResponse> {
    return this.profileService.getMyProfile(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.UPDATE_ME)
  updateMyProfile(
    @Payload()
    dto: UpdateMyProfileDto,
  ): Promise<ProfileResponse> {
    return this.profileService.updateMyProfile(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.CHANGE_USERNAME)
  changeUsername(
    @Payload()
    dto: ChangeUsernameDto,
  ): Promise<ChangeUsernameResponse> {
    return this.profileService.changeUsername(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.VISIBILITY_OPTIONS)
  getVisibilityOptions(): ProfileVisibilityOptionsResponse {
    return this.profileService.getVisibilityOptions();
  }

  @MessagePattern(PROFILE_PATTERNS.CHANGE_VISIBILITY)
  changeVisibility(
    @Payload()
    dto: ChangeProfileVisibilityDto,
  ): Promise<ChangeProfileVisibilityResponse> {
    return this.profileService.changeVisibility(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.SEARCH)
  searchProfiles(
    @Payload()
    dto: SearchProfilesDto,
  ): Promise<SearchProfilesResponse> {
    return this.profileService.searchProfiles(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.PUBLIC_BY_USERNAME)
  getPublicProfile(
    @Payload()
    dto: GetPublicProfileDto,
  ): Promise<PublicProfileResponse> {
    return this.profileService.getPublicProfile(dto);
  }

  @MessagePattern(PROFILE_PATTERNS.DELETE_AVATAR)
  deleteMyAvatar(
    @Payload()
    dto: DeleteMyAvatarDto,
  ): Promise<{ success: true }> {
    return this.profileService.deleteMyAvatar(dto);
  }
}