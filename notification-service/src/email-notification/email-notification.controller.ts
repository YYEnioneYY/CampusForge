import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS } from '../common/kafka/notification-patterns';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { SendPasswordResetDto } from './dto/send-password-reset.dto';
import { SendPasswordChangedDto } from './dto/send-password-changed.dto';
import { EmailNotificationService } from './email-notification.service';
import { AccountRestoreEventDto } from './dto/account-restore-event.dto';

@Controller()
export class EmailNotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @EventPattern(NOTIFICATION_PATTERNS.SEND_EMAIL_VERIFICATION)
  async sendEmailVerification(@Payload() dto: SendEmailVerificationDto): Promise<void> {
    await this.emailNotificationService.sendEmailVerification(dto);
  }

  @EventPattern(NOTIFICATION_PATTERNS.SEND_PASSWORD_RESET)
  async sendPasswordReset(@Payload() dto: SendPasswordResetDto): Promise<void> {
    await this.emailNotificationService.sendPasswordReset(dto);
  }

  @EventPattern(NOTIFICATION_PATTERNS.SEND_PASSWORD_CHANGED)
  async sendPasswordChanged(@Payload() dto: SendPasswordChangedDto): Promise<void> {
    await this.emailNotificationService.sendPasswordChanged(dto);
  }

  @EventPattern(NOTIFICATION_PATTERNS.ACCOUNT_RESTORE_SEND)
  async sendAccountRestoreEmail(@Payload() dto: AccountRestoreEventDto): Promise<void> {
    await this.emailNotificationService.sendAccountRestoreEmail(dto);
  }
}