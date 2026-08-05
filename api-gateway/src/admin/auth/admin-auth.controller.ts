import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
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
import type {
  AuthenticatedUser,
} from '../../common/types/authenticated-user.type';
import {
  AdminAuthService,
} from './admin-auth.service';
import {
  AdminGetUserResponseDto,
} from './dto/admin-get-user-response.dto';

@ApiTags('Admin — Users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
@UseGuards(
  AccessTokenGuard,
  RolesGuard,
)
@Roles(SystemRole.ADMIN)
export class AdminAuthController {
  constructor(
    private readonly adminAuthService:
      AdminAuthService,
  ) {}

  @Get(':userId')
  @ApiOperation({
    summary:
      'Получение информации о конкретном пользователе',
  })
  async getUser(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param(
      'userId',
      ParseUUIDPipe,
    )
    targetUserId: string,
  ): Promise<AdminGetUserResponseDto> {
    return this.adminAuthService.getUser(
      user.sub,
      targetUserId,
    );
  }
}