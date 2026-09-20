import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  AccessTokenGuard,
} from '../common/guards/access-token.guard';

import {
  CurrentUser,
} from '../common/decorators/current-user.decorator';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  ProfileService,
} from './profile.service';

import {
  ProfileResponseDto,
} from './dto/profile-response.dto';
import { CreateAvatarUploadResponseDto } from './dto/create-avatar-upload-response.dto';

import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeUsernameResponseDto } from './dto/change-username-response.dto';

import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateMyProfileResponseDto } from './dto/update-my-profile-response.dto';

import { ProfileVisibilityOptionsResponseDto } from './dto/profile-visibility-options-response.dto';
import { ChangeProfileVisibilityDto } from './dto/change-profile-visibility.dto';
import { ChangeProfileVisibilityResponseDto } from './dto/change-profile-visibility-response.dto';

import { SearchProfilesQueryDto } from './dto/search-profiles-query.dto';
import { SearchProfilesResponseDto } from './dto/search-profiles-response.dto';

import { GetPublicProfileParamsDto } from './dto/get-public-profile-params.dto';
import { PublicProfileResponseDto } from './dto/public-profile-response.dto';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(AccessTokenGuard)
export class ProfileController {
  constructor(
    private readonly profileService:
      ProfileService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Получение профиля данного пользователя',
  })
  async getMyProfile(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<ProfileResponseDto> {
    return this.profileService.getMyProfile(user.sub);
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Поиск профилей пользователей',
  })
  async searchProfiles(
    @Query()
    dto: SearchProfilesQueryDto,
  ): Promise<SearchProfilesResponseDto> {
    return this.profileService.searchProfiles(dto);
  }

  @Patch('me')
  @ApiOperation({
    summary:
      'Изменение профиля пользователя',
  })
  async updateMyProfile(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Body()
    dto: UpdateMyProfileDto,
  ): Promise<UpdateMyProfileResponseDto> {
    return this.profileService.updateMyProfile(
      user.sub,
      dto,
    );
  }

  @Patch('me/username')
  @ApiOperation({
    summary:
      'Изменение username пользователя',
  })
  async changeUsername(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Body()
    dto: ChangeUsernameDto,
  ): Promise<ChangeUsernameResponseDto> {
    return this.profileService.changeUsername(
      user.sub,
      dto.username,
    );
  }

  @Get('visibility-options')
  @ApiOperation({
    summary:
      'Получение доступных вариантов видимости профиля',
  })
  async getVisibilityOptions(): Promise<ProfileVisibilityOptionsResponseDto> {
    return this.profileService.getVisibilityOptions();
  }

  @Patch('me/visibility')
  @ApiOperation({
    summary:
      'Изменение видимости профиля',
  })
  async changeVisibility(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Body()
    dto: ChangeProfileVisibilityDto,
  ): Promise<ChangeProfileVisibilityResponseDto> {
    return this.profileService.changeVisibility(
      user.sub,
      dto.visibility,
    );
  }

  @Post('me/avatar/upload')
  @ApiOperation({
    summary:
      'Получение url на загрузку аватарки',
  })
  async createAvatarUpload(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<CreateAvatarUploadResponseDto> {
    return this.profileService.createAvatarUpload(user.sub);
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удаление аватарки пользователя',
  })
  async deleteMyAvatar(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.profileService.deleteMyAvatar(user.sub);
  }

  @Get(':username')
  @ApiOperation({
    summary:
      'Получение профиля пользователя по username',
  })
  async getPublicProfile(
    @Param()
    params: GetPublicProfileParamsDto,
  ): Promise<PublicProfileResponseDto> {
    return this.profileService.getPublicProfile(
      params.username,
    );
  }
}