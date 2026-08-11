import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
  Body,
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

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../../common/enums/system-role.enum';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { AdminAuthService } from './admin-auth.service';
import { AdminGetUserResponseDto } from './dto/admin-get-user-response.dto';

import { AdminGetUsersQueryDto } from './dto/admin-get-users-query.dto';
import { AdminGetUsersResponseDto } from './dto/admin-get-users-response.dto';

import { AdminChangeUserRoleDto } from './dto/admin-change-user-role.dto';

@ApiTags('Admin — Auth')
@ApiBearerAuth('access-token')
@Controller('admin/auth')
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

  @Get('users')
  @ApiOperation({
    summary: 'Получение всех пользователей',
  })
  async getUsers(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Query()
    query: AdminGetUsersQueryDto,
  ): Promise<AdminGetUsersResponseDto> {
    return this.adminAuthService.getUsers(
      user.sub,
      query,
    );
  }

  @Get('users/:userId')
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

  @Patch('users/:userId/block')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Блокировка пользователя',
  })
  async blockUser(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param(
      'userId',
      ParseUUIDPipe,
    )
    targetUserId: string,
  ): Promise<void> {
    await this.adminAuthService.blockUser(
      user.sub,
      targetUserId,
    );
  }

  @Patch('users/:userId/unblock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Разблокировка пользователя',
  })
  async unblockUser(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param(
      'userId',
      ParseUUIDPipe,
    )
    targetUserId: string,
  ): Promise<void> {
    await this.adminAuthService.unblockUser(
      user.sub,
      targetUserId,
    );
  }

  @Patch('auth/:userId/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Смена роли пользователя',
  })
  async changeUserRole(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param(
      'userId',
      ParseUUIDPipe,
    )
    targetUserId: string,
  
    @Body()
    dto: AdminChangeUserRoleDto,
  ): Promise<void> {
    await this.adminAuthService.changeUserRole(
      user.sub,
      targetUserId,
      dto,
    );
  }
}