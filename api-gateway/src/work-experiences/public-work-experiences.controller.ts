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
  GetPublicWorkExperiencesResponseDto,
} from './dto/get-public-work-experiences-response.dto';

import {
  WorkExperiencesService,
} from './work-experiences.service';

@ApiTags('Work experiences')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(AccessTokenGuard)
export class PublicWorkExperiencesController {
  constructor(
    private readonly workExperiencesService:
      WorkExperiencesService,
  ) {}

  @Get(':username/work-experiences')
  @ApiOperation({
    summary:
      'Получение публичного опыта работы пользователя по username',
  })
  getPublicWorkExperiences(
    @Param()
    params: GetPublicProfileParamsDto,
  ): Promise<GetPublicWorkExperiencesResponseDto> {
    return this.workExperiencesService
      .getPublicWorkExperiences(
        params.username,
      );
  }
}