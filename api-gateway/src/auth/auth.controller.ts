import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiHeader({
    name: 'x-device-name',
    required: false,
    description: 'Название устройства',
  })
  register(
    @Body() body: RegisterDto,
    @Headers('x-request-id') requestId?: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-name') deviceName?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.register(
      body,
      requestId,
      userAgent,
      deviceName,
      ipAddress,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiHeader({
    name: 'x-device-name',
    required: false,
    description: 'Название устройства',
  })
  login(
    @Body() body: LoginDto,
    @Headers('x-request-id') requestId?: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-device-name') deviceName?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.login(
      body,
      requestId,
      userAgent,
      deviceName,
      ipAddress,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновить access и refresh токены' })
  refresh(
    @Body() body: RefreshTokenDto,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.refresh(body, requestId);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выйти из текущей сессии' })
  logout(
    @Body() body: RefreshTokenDto,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.logout(body, requestId);
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Выйти со всех сессий' })
  logoutAll(
    @Body() body: RefreshTokenDto,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.logoutAll(body, requestId);
  }

  @Post('logout-session')
  @ApiOperation({ summary: 'Завершить конкретную сессию' })
  logoutSession(
    @Body() body: LogoutSessionDto,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.logoutSession(body, requestId);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Получить список сессий пользователя' })
  getSessions(
    @Body() body: RefreshTokenDto,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.getSessions(body, requestId);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Подтвердить email по ссылке' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Email verification token',
  })
  verifyEmail(
    @Query('token') token: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.verifyEmail(token, requestId);
  }

  @Post('resend-email-verification')
  @ApiOperation({ summary: 'Повторно отправить письмо подтверждения email' })
  @ApiBearerAuth('access-token')
  resendEmailVerification(
    @Headers('authorization') authorization?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    return this.authService.resendEmailVerification(authorization, requestId);
  }
}