import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  CurrentUser,
} from '../common/decorators/current-user.decorator';

import {
  AccessTokenGuard,
} from '../common/guards/access-token.guard';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  GetMyLinksResponseDto,
} from './dto/get-my-links-response.dto';

import {
  UserLinksService,
} from './user-links.service';

import {
  CreateUserLinkDto,
} from './dto/create-user-link.dto';

import {
  CreateUserLinkResponseDto,
} from './dto/create-user-link-response.dto';

import {
  UpdateUserLinkDto,
} from './dto/update-user-link.dto';

import {
  UpdateUserLinkResponseDto,
} from './dto/update-user-link-response.dto';

@ApiTags('User links')
@ApiBearerAuth('access-token')
@Controller('profile/me/links')
@UseGuards(AccessTokenGuard)
export class UserLinksController {
  constructor(
    private readonly userLinksService: UserLinksService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получение ссылок текущего пользователя',
  })
  getMyLinks(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<GetMyLinksResponseDto> {
    return this.userLinksService.getMyLinks(
      user.sub,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Добавление ссылки текущему пользователю',
  })
  createUserLink(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateUserLinkDto,
  ): Promise<CreateUserLinkResponseDto> {
    return this.userLinksService.createUserLink(
      user.sub,
      dto,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Изменение ссылки текущего пользователя',
  })
  updateUserLink(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,

    @Body()
    dto: UpdateUserLinkDto,
  ): Promise<UpdateUserLinkResponseDto> {
    return this.userLinksService.updateUserLink(
      user.sub,
      id,
      dto,
    );
  }
}