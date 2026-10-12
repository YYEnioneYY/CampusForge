import {
  Controller,
  Get,
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
  GetMyWorkExperiencesResponseDto,
} from './dto/get-my-work-experiences-response.dto';

import {
  WorkExperiencesService,
} from './work-experiences.service';

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
}