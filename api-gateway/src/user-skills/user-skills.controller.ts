import {
  Body,
  Controller,
  Get,
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

import {
  GetMyUserSkillsResponseDto,
} from './dto/get-my-user-skills-response.dto';

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

  @Get()
  @ApiOperation({
    summary:
      'Получение навыков текущего пользователя',
  })
  getMyUserSkills(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<GetMyUserSkillsResponseDto> {
    return this.userSkillsService.getMyUserSkills(user.sub);
  }
}