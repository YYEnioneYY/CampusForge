import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
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
    return this.profileService
      .changeUsername(
        user.sub,
        dto.username,
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
}