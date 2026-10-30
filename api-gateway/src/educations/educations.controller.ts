import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

import {
  UpdateEducationDto,
} from './dto/update-education.dto';

import {
  UpdateEducationResponseDto,
} from './dto/update-education-response.dto';

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

  @Patch(':id')
  @ApiOperation({
    summary:
      'Изменение образования текущего пользователя',
  })
  updateEducation(
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
    dto: UpdateEducationDto,
  ): Promise<UpdateEducationResponseDto> {
    return this.educationsService.updateEducation(
      user.sub,
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удаление образования текущего пользователя',
  })
  async deleteEducation(
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
    await this.educationsService.deleteEducation(
      user.sub,
      id,
    );
  }
}