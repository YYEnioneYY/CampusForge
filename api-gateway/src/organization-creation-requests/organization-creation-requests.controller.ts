import {
  Body,
  Controller,
  Post,
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
  CreateOrganizationCreationRequestDto,
} from './dto/create-organization-creation-request.dto';

import {
  CreateOrganizationCreationRequestResponseDto,
} from './dto/create-organization-creation-request-response.dto';

import {
  OrganizationCreationRequestsService,
} from './organization-creation-requests.service';

import {
  GetMyOrganizationCreationRequestsResponseDto,
} from './dto/get-my-organization-creation-requests-response.dto';

@ApiTags('Organization creation requests')
@ApiBearerAuth('access-token')
@Controller('organizations/creation-requests')
@UseGuards(AccessTokenGuard)
export class OrganizationCreationRequestsController {
  constructor(
    private readonly service:
      OrganizationCreationRequestsService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Создание черновика заявки на организацию',
  })
  createDraft(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto:
      CreateOrganizationCreationRequestDto,
  ): Promise<CreateOrganizationCreationRequestResponseDto> {
    return this.service.createDraft(
      user.sub,
      dto,
    );
  }

  @Get('me')
  @ApiOperation({
    summary:
      'Получение своих заявок на создание организаций',
  })
  getMy(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<GetMyOrganizationCreationRequestsResponseDto> {
    return this.service.getMy(
      user.sub,
    );
  }
}