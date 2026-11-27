import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  Roles,
} from '../../common/decorators/roles.decorator';

import {
  SystemRole,
} from '../../common/enums/system-role.enum';

import {
  AccessTokenGuard,
} from '../../common/guards/access-token.guard';

import {
  RolesGuard,
} from '../../common/guards/roles.guard';

import {
  GetOrganizationCreationRequestsQueryDto,
} from './dto/get-organization-creation-requests-query.dto';

import {
  GetOrganizationCreationRequestsResponseDto,
} from './dto/get-organization-creation-requests-response.dto';

import {
  OrganizationCreationRequestsService,
} from './organization-creation-requests.service';

@ApiTags('Moderation — Organization creation requests')
@ApiBearerAuth('access-token')
@Controller('admin/organization-creation-requests')
@UseGuards(
  AccessTokenGuard,
  RolesGuard,
)
@Roles(
  SystemRole.MODERATOR,
  SystemRole.ADMIN,
)
export class OrganizationCreationRequestsController {
  constructor(
    private readonly service:
      OrganizationCreationRequestsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получение заявок на создание организаций',
  })
  getRequests(
    @Query()
    query:
      GetOrganizationCreationRequestsQueryDto,
  ): Promise<GetOrganizationCreationRequestsResponseDto> {
    return this.service
      .getRequests(query);
  }
}