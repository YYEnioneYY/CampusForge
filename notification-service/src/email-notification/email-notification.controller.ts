import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS } from '../common/kafka/notification-patterns';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { SendPasswordResetDto } from './dto/send-password-reset.dto';
import { SendPasswordChangedDto } from './dto/send-password-changed.dto';
import { EmailNotificationService } from './email-notification.service';

@Controller()
export class EmailNotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @EventPattern(NOTIFICATION_PATTERNS.SEND_EMAIL_VERIFICATION)
  async sendEmailVerification(@Payload() dto: SendEmailVerificationDto) {
    await this.emailNotificationService.sendEmailVerification(dto);

    return {
      success: true,
    };
  }

  @EventPattern(NOTIFICATION_PATTERNS.SEND_PASSWORD_RESET)
  async sendPasswordReset(@Payload() dto: SendPasswordResetDto) {
    await this.emailNotificationService.sendPasswordReset(dto);

    return {
      success: true,
    };
  }

  @EventPattern(NOTIFICATION_PATTERNS.SEND_PASSWORD_CHANGED)
  async sendPasswordChanged(@Payload() dto: SendPasswordChangedDto) {
    await this.emailNotificationService.sendPasswordChanged(dto);

    return {
      success: true,
    };
  }
}