import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  Request,
  Response,
} from 'express';
import { ClientContextService } from '../common/http/client-context.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,

    private readonly clientContextService:
      ClientContextService,

    private readonly authCookieService:
      AuthCookieService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Регистрация пользователя',
  })
  @ApiCreatedResponse({
    description:
      'Пользователь успешно зарегистрирован',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Переданы некорректные данные',
  })
  @ApiConflictResponse({
    description:
      'Пользователь с таким email уже существует',
  })
  @ApiServiceUnavailableResponse({
    description:
      'Сервис авторизации временно недоступен',
  })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<RegisterResponseDto> {
    const clientContext =
      this.clientContextService.fromRequest(
        request,
      );

    const result =
      await this.authService.register(
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
}