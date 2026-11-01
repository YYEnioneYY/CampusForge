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
  GetPublicEducationsResponseDto,
} from './dto/get-public-educations-response.dto';

import {
  EducationsService,
} from './educations.service';

@ApiTags('Educations')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(AccessTokenGuard)
export class PublicEducationsController {
  constructor(
    private readonly educationsService: EducationsService,
  ) {}

  @Get(':username/educations')
  @ApiOperation({
    summary:
      'Получение образования пользователя по username',
  })
  getPublicEducations(
    @Param()
    params: GetPublicProfileParamsDto,
  ): Promise<GetPublicEducationsResponseDto> {
    return this.educationsService.getPublicEducations(
      params.username,
    );
  }
}