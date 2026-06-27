import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { GetSessionsDto, LogoutSessionDto } from './dto/sessions.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @MessagePattern('auth.login')
  async login(@Payload() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() payload: RefreshDto) {
    return this.authService.refresh(payload);
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() payload: LogoutDto) {
    return this.authService.logout(payload);
  }

  @MessagePattern('auth.logout-all')
  async logoutAll(@Payload() payload: LogoutDto) {
    return this.authService.logoutAll(payload);
  }

  @MessagePattern('auth.sessions')
  async getSessions(@Payload() payload: GetSessionsDto) {
    return this.authService.getSessions(payload);
  }

  @MessagePattern('auth.logout-session')
  async logoutSession(@Payload() payload: LogoutSessionDto) {
    return this.authService.logoutSession(payload);
  }

  @MessagePattern('auth.verify-email')
  async verifyEmail(@Payload() payload: VerifyEmailDto) {
    return this.authService.verifyEmail(payload);
  }

  @MessagePattern('auth.resend-email-verification')
  async resendEmailVerification(
    @Payload() payload: ResendEmailVerificationDto,
  ) {
    return this.authService.resendEmailVerification(payload);
  }
}