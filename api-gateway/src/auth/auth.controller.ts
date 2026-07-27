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
import { ClientContextService } from '../common/http/client-context.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientContextService: ClientContextService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description:
      'Создаёт пользователя, авторизационную сессию и отправляет письмо для подтверждения email.',
  })
  @ApiCreatedResponse({
    type: RegisterResponseDto,
  })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RegisterResponseDto> {
    const clientContext =
      this.clientContextService.fromRequest(request);

    const result = await this.authService.register(
      dto,
      clientContext,
    );

    this.authCookieService.setRefreshToken(
      response,
      result.refreshToken.value,
      result.refreshToken.expiresAt,
    );

    return result.body;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход пользователя',
    description:
      'Проверяет email и пароль, создаёт авторизационную сессию и устанавливает refresh token в HttpOnly cookie.',
  })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LoginResponseDto> {
    const clientContext =
      this.clientContextService.fromRequest(
        request,
      );
  
    const result =
      await this.authService.login(
        dto,
        clientContext,
      );
  
    this.authCookieService.setRefreshToken(
      response,
      result.refreshToken.value,
      result.refreshToken.expiresAt,
    );
  
    return result.body;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление токенов',
    description:
      'Проверяет refresh token из HttpOnly cookie, создаёт новую сессию и возвращает новый access token.',
  })
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Refresh token отсутствует или недействителен',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<RefreshResponseDto> {
    const refreshToken =
      this.authCookieService.getRefreshToken(
        request,
      );
  
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is missing',
      );
    }
  
    const clientContext =
      this.clientContextService.fromRequest(
        request,
      );
  
    const result =
      await this.authService.refresh(
        refreshToken,
        clientContext,
      );
  
    this.authCookieService.setRefreshToken(
      response,
      result.refreshToken.value,
      result.refreshToken.expiresAt,
    );
  
    return result.body;
  }
}