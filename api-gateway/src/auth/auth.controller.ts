import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  Request,
  Response,
} from 'express';

import { UseAuthSessionFlow } from './decorators/use-auth-session-flow.decorator';
import { CurrentClientContext } from './decorators/current-client-context.decorator';
import { RefreshTokenCookie } from './decorators/refresh-token-cookie.decorator';

import { ClientContextService } from '../common/http/client-context.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import type { ClientContext } from '../common/http/types/client-context.type';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResult } from './types/register/register-result.type';
import { LoginResult } from './types/login/login-result.type';
import { RefreshResult } from './types/refresh/refresh-result.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description:
      'Создаёт пользователя, авторизационную сессию и отправляет письмо для подтверждения email.',
  })
  @UseAuthSessionFlow()
  @ApiCreatedResponse({
    type: RegisterResponseDto,
  })
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
}