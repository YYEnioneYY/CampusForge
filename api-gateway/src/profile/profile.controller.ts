import {
  Controller,
  Get,
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

@ApiTags('Profile')
@ApiBearerAuth()
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
  getMyProfile(
    @CurrentUser()
    actor: AuthenticatedUser,
  ): Promise<ProfileResponseDto> {
    return this.profileService.getMyProfile(actor.sub);
  }
}