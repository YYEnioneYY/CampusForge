import {
  Controller,
  Get,
  Body,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
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
  GetMyWorkExperiencesResponseDto,
} from './dto/get-my-work-experiences-response.dto';

import {
  WorkExperiencesService,
} from './work-experiences.service';

import {
  CreateWorkExperienceDto,
} from './dto/create-work-experience.dto';

import {
  CreateWorkExperienceResponseDto,
} from './dto/create-work-experience-response.dto';

import {
  UpdateWorkExperienceDto,
} from './dto/update-work-experience.dto';

import {
  UpdateWorkExperienceResponseDto,
} from './dto/update-work-experience-response.dto';

@ApiTags('Work experiences')
@ApiBearerAuth('access-token')
@Controller(
  'profile/me/work-experiences',
)
@UseGuards(AccessTokenGuard)
export class WorkExperiencesController {
  constructor(
    private readonly workExperiencesService: WorkExperiencesService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получение опыта работы текущего пользователя',
  })
  getMyWorkExperiences(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<GetMyWorkExperiencesResponseDto> {
    return this.workExperiencesService.getMyWorkExperiences(
      user.sub,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Добавление опыта работы текущему пользователю',
  })
  createWorkExperience(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateWorkExperienceDto,
  ): Promise<CreateWorkExperienceResponseDto> {
    return this.workExperiencesService.createWorkExperience(
      user.sub,
      dto,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Изменение опыта работы текущего пользователя',
  })
  updateWorkExperience(
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
    dto: UpdateWorkExperienceDto,
  ): Promise<UpdateWorkExperienceResponseDto> {
    return this.workExperiencesService.updateWorkExperience(
      user.sub,
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удаление опыта работы текущего пользователя',
  })
  async deleteWorkExperience(
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
    await this.workExperiencesService.deleteWorkExperience(
      user.sub,
      id,
    );
  }
}