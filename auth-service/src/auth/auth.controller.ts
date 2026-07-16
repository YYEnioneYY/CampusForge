import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_PATTERNS } from 'src/common/kafka/auth-patterns';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutAllDto } from './dto/logout-all.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MeDto } from './dto/me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminGetUsersDto } from './dto/admin-get-users.dto';
import { AdminBlockUserDto } from './dto/admin-block-user.dto';
import { AdminUnblockUserDto } from './dto/admin-unblock-user.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RequestAccountRestoreDto } from './dto/request-account-restore.dto';
import { ConfirmAccountRestoreDto } from './dto/confirm-account-restore.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH)
  refresh(@Payload() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT_ALL)
  logoutAll(@Payload() dto: LogoutAllDto) {
    return this.authService.logoutAll(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  logout(@Payload() dto: LogoutDto) {
    return this.authService.logout(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT_SESSION)
  logoutSession(@Payload() dto: LogoutSessionDto) {
    return this.authService.logoutSession(dto);
  }

  @MessagePattern(AUTH_PATTERNS.GET_SESSIONS)
  getSessions(@Payload() dto: GetSessionsDto) {
    return this.authService.getSessions(dto);
  }

  @MessagePattern(AUTH_PATTERNS.RESEND_EMAIL_VERIFICATION)
  resendEmailVerification(@Payload() dto: ResendEmailVerificationDto) {
    return this.authService.resendEmailVerification(dto);
  }

  @MessagePattern(AUTH_PATTERNS.VERIFY_EMAIL)
  verifyEmail(@Payload() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @MessagePattern(AUTH_PATTERNS.PASSWORD_RESET_REQUEST)
  requestPasswordReset(@Payload() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @MessagePattern(AUTH_PATTERNS.PASSWORD_RESET_CONFIRM)
  resetPassword(@Payload() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @MessagePattern(AUTH_PATTERNS.ME)
  me(@Payload() dto: MeDto) {
    return this.authService.me(dto);
  }

  @MessagePattern(AUTH_PATTERNS.CHANGE_PASSWORD)
  changePassword(@Payload() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @MessagePattern(AUTH_PATTERNS.DELETE_ACCOUNT)
  deleteAccount(@Payload() dto: DeleteAccountDto) {
    return this.authService.deleteAccount(dto);
  }

  @MessagePattern(AUTH_PATTERNS.ACCOUNT_RESTORE_REQUEST)
  requestAccountRestore(@Payload() dto: RequestAccountRestoreDto) {
    return this.authService.requestAccountRestore(dto);
  }

  @MessagePattern(AUTH_PATTERNS.ACCOUNT_RESTORE_CONFIRM)
  confirmAccountRestore(@Payload() dto: ConfirmAccountRestoreDto) {
    return this.authService.confirmAccountRestore(dto);
  }

  // ADMIN routes

  @MessagePattern(AUTH_PATTERNS.ADMIN_GET_USERS)
  adminGetUsers(@Payload() dto: AdminGetUsersDto) {
    return this.authService.adminGetUsers(dto);
  }

  @MessagePattern(AUTH_PATTERNS.ADMIN_BLOCK_USER)
  adminBlockUser(@Payload() dto: AdminBlockUserDto) {
    return this.authService.adminBlockUser(dto);
  }

  @MessagePattern(AUTH_PATTERNS.ADMIN_UNBLOCK_USER)
  adminUnblockUser(@Payload() dto: AdminUnblockUserDto) {
    return this.authService.adminUnblockUser(dto);
  }
}