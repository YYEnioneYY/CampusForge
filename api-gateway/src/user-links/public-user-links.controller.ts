import {
  Controller,
  Get,
  Param,
  UseGuards,
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
  GetPublicProfileParamsDto,
} from '../profile/dto/get-public-profile-params.dto';

import {
  GetPublicUserLinksResponseDto,
} from './dto/get-public-user-links-response.dto';

import {
  UserLinksService,
} from './user-links.service';

@ApiTags('User links')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(AccessTokenGuard)
export class PublicUserLinksController {
  constructor(
    private readonly userLinksService: UserLinksService,
  ) {}

  @Get(':username/links')
  @ApiOperation({
    summary:
      'Получение публичных ссылок пользователя по username',
  })
  getPublicUserLinks(
    @Param()
    params: GetPublicProfileParamsDto,
  ): Promise<GetPublicUserLinksResponseDto> {
    return this.userLinksService.getPublicUserLinks(
      params.username,
    );
  }
}