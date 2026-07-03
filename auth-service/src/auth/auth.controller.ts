import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutAllDto } from './dto/logout-all.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  register(@Payload() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @MessagePattern('auth.login')
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern('auth.refresh')
  refresh(@Payload() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @MessagePattern('auth.logout_all')
  logoutAll(@Payload() dto: LogoutAllDto) {
    return this.authService.logoutAll(dto);
  }

  @MessagePattern('auth.logout')
  logout(@Payload() dto: LogoutDto) {
    return this.authService.logout(dto);
  }

  @MessagePattern('auth.logout_session')
  logoutSession(@Payload() dto: LogoutSessionDto) {
    return this.authService.logoutSession(dto);
  }

  @MessagePattern('auth.get_sessions')
  getSessions(@Payload() dto: GetSessionsDto) {
    return this.authService.getSessions(dto);
  }
}