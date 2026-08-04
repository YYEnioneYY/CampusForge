import {
  Body,
  Controller,
  Delete,
  Post,
  Get,
  Param,
  Patch,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import type {
  Response,
} from 'express';

import { UseAuthSessionFlow } from './decorators/use-auth-session-flow.decorator';
import { CurrentClientContext } from './decorators/current-client-context.decorator';
import { RefreshTokenCookie } from './decorators/refresh-token-cookie.decorator';

import { ClientContextService } from '../common/http/client-context.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import type { ClientContext } from '../common/http/types/client-context.type';

import { AccessTokenGuard } from './guards/access-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { SessionIdParamsDto } from './dto/session-id-params.dto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutAllDto } from './dto/logout-all.dto';

import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { GetSessionsResponseDto } from './dto/get-sessions-response.dto';

import { RegisterResult } from './types/register/register-result.type';
import { LoginResult } from './types/login/login-result.type';
import { RefreshResult } from './types/refresh/refresh-result.type';

import { RenameSessionDto } from './dto/rename-session.dto';

import { VerifyEmailDto } from './dto/verify-email.dto';

import { MeResponseDto } from './dto/me/me-response.dto';

import { RequestPasswordResetDto } from './dto/password-reset/request-password-reset.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description:
      'Создаёт пользователя, авторизационную сессию и отправляет письмо для подтверждения email.',
  })
  @UseAuthSessionFlow()
  async register(
    @Body() 
    dto: RegisterDto,
    
    @CurrentClientContext()
    clientContext: ClientContext,
  ): Promise<RegisterResult> {
    return this.authService.register(
      dto,
      clientContext,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход пользователя',
    description:
      'Проверяет email и пароль, создаёт авторизационную сессию и устанавливает refresh token в HttpOnly cookie.',
  })
  @UseAuthSessionFlow()
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(
    @Body()
    dto: LoginDto,
  
    @CurrentClientContext()
    clientContext: ClientContext,
  ): Promise<LoginResult> {
    return this.authService.login(
      dto,
      clientContext,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление токенов',
    description:
      'Проверяет refresh token из HttpOnly cookie, создаёт новую сессию и возвращает новый access token.',
  })
  @UseAuthSessionFlow()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  async refresh(
    @RefreshTokenCookie()
    refreshToken: string,
  
    @CurrentClientContext()
    clientContext: ClientContext,
  ): Promise<RefreshResult> {
    return this.authService.refresh(
      refreshToken,
      clientContext,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Выход из текущей сессии',
  })
  @ApiNoContentResponse({
    description: 'Current session was revoked',
  })
  async logout(
    @RefreshTokenCookie()
    refreshToken: string,
  
    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    await this.authService.logout(
      refreshToken,
    );
  
    this.authCookieService.clearRefreshToken(
      response,
    );
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Выход из всех сессий аккаунта',
  })
  @ApiNoContentResponse({
    description: 'User sessions were revoked',
  })
  async logoutAll(
    @Body()
    dto: LogoutAllDto,
  
    @RefreshTokenCookie()
    refreshToken: string,
  
    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    await this.authService.logoutAll(
      refreshToken,
      dto.exceptCurrent,
    );
  
    if (dto.exceptCurrent !== true) {
      this.authCookieService.clearRefreshToken(
        response,
      );
    }
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удаление конкретной сессии аккаунта',
  })
  async logoutSession(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param()
    params: SessionIdParamsDto,
  
    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    await this.authService.logoutSession(
      user.sub,
      params.sessionId,
    );
  
    if (params.sessionId === user.sid) {
      this.authCookieService.clearRefreshToken(
        response,
      );
    }
  }

  @Get('sessions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Получение активных сессий пользователя',
  })
  @ApiOkResponse({
    type: GetSessionsResponseDto,
  })
  async getSessions(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<GetSessionsResponseDto> {
    return this.authService.getSessions(
      user.sub,
      user.sid,
    );
  }

  @Patch('sessions/:sessionId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Переименование сессии пользователя',
  })
  async renameSession(
    @CurrentUser()
    user: AuthenticatedUser,
  
    @Param()
    params: SessionIdParamsDto,
  
    @Body()
    dto: RenameSessionDto,
  ): Promise<void> {
    await this.authService.renameSession(
      user.sub,
      user.sid,
      params.sessionId,
      dto.sessionName,
    );
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Подтверждение почты пользователем',
  })
  async verifyEmail(
    @Body()
    dto: VerifyEmailDto,
  ): Promise<void> {
    await this.authService.verifyEmail(
      dto.token,
    );
  }

  @Post('resend-email-verification')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Повторная отправка письма для подтверждения почты',
  })
  async resendEmailVerification(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.authService.resendEmailVerification(
      user.sub,
    );
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Получение данных пользователя',
  })
  async me(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<MeResponseDto> {
    return this.authService.me(
      user.sub,
    );
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Запрос о смене пароля на почту',
  })
  async requestPasswordReset(
    @Body()
    dto: RequestPasswordResetDto,
  ): Promise<void> {
    await this.authService.requestPasswordReset(
      dto,
    );
  }
}