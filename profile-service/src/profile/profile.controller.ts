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

import { MEDIA_EVENT_PATTERNS } from '../kafka/patterns/media-event-patterns';

import { MediaFileReadyDto } from './dto/media-file-ready.dto';

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
}