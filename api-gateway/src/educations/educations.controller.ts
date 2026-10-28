import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
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
  GetMyEducationsResponseDto,
} from './dto/get-my-educations-response.dto';

import {
  EducationsService,
} from './educations.service';

import {
  CreateEducationDto,
} from './dto/create-education.dto';

import {
  CreateEducationResponseDto,
} from './dto/create-education-response.dto';

@ApiTags('Educations')
@ApiBearerAuth('access-token')
@Controller('profile/me/educations')
@UseGuards(AccessTokenGuard)
export class EducationsController {
  constructor(
    private readonly educationsService: EducationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получение образования текущего пользователя',
  })
  getMyEducations(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<GetMyEducationsResponseDto> {
    return this.educationsService.getMyEducations(
      user.sub,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Добавление образования текущему пользователю',
  })
  createEducation(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateEducationDto,
  ): Promise<CreateEducationResponseDto> {
    return this.educationsService.createEducation(
      user.sub,
      dto,
    );
  }
}