import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
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

import { UpdateOrganizationCreationRequestDto } from './dto/update-organization-creation-request.dto';
import { UpdateOrganizationCreationRequestResponseDto } from './dto/update-organization-creation-request-response.dto';

import { SubmitOrganizationCreationRequestResponseDto } from './dto/submit-organization-creation-request-response.dto';

import {
  CancelOrganizationCreationRequestResponseDto,
} from './dto/cancel-organization-creation-request-response.dto';

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

  @Patch(':requestId')
  @ApiOperation({
    summary:
      'Обновление черновика заявки на создание организации',
  })
  updateDraft(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param(
      'requestId',
      ParseUUIDPipe,
    )
    requestId: string,

    @Body()
    dto: UpdateOrganizationCreationRequestDto,
  ): Promise<UpdateOrganizationCreationRequestResponseDto> {
    return this.service.updateDraft(
      user.sub,
      requestId,
      dto,
    );
  }

  @Post(':requestId/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Отправка заявки на создание организации',
  })
  submit(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param(
      'requestId',
      ParseUUIDPipe,
    )
    requestId: string,
  ): Promise<SubmitOrganizationCreationRequestResponseDto> {
    return this.service.submit(
      user.sub,
      requestId,
    );
  }

  @Delete(':requestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удаление черновика заявки на создание организации',
  })
  async deleteDraft(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param(
      'requestId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    requestId: string,
  ): Promise<void> {
    await this.service.deleteDraft(
      user.sub,
      requestId,
    );
  }

  @Post(':requestId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Отмена отправленной заявки на создание организации',
  })
  cancel(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param(
      'requestId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    requestId: string,
  ): Promise<CancelOrganizationCreationRequestResponseDto> {
    return this.service.cancel(
      user.sub,
      requestId,
    );
  }
}