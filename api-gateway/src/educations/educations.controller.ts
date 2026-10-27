import {
  Controller,
  Get,
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
}