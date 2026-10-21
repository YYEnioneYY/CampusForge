import {
  Body,
  Controller,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
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
  CreateUserSkillsDto,
} from './dto/create-user-skills.dto';

import {
  CreateUserSkillsResponseDto,
} from './dto/create-user-skills-response.dto';

import {
  UserSkillsService,
} from './user-skills.service';

@ApiTags('User skills')
@ApiBearerAuth('access-token')
@Controller('profile/me/skills')
@UseGuards(AccessTokenGuard)
export class UserSkillsController {
  constructor(
    private readonly userSkillsService:
      UserSkillsService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Добавление навыков текущему пользователю',
  })
  @ApiCreatedResponse({
    type:
      CreateUserSkillsResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'Профиль или один из навыков не найден',
  })
  @ApiConflictResponse({
    description:
      'Навык уже добавлен или достигнут лимит',
  })
  createUserSkills(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateUserSkillsDto,
  ): Promise<CreateUserSkillsResponseDto> {
    return this.userSkillsService.createUserSkills(
      user.sub,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удаление навыка текущего пользователя',
  })
  @ApiNotFoundResponse({
    description:
      'Навык пользователя не найден',
  })
  async deleteUserSkill(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<void> {
    await this.userSkillsService.deleteUserSkill(
      user.sub,
      id,
    );
  }
}