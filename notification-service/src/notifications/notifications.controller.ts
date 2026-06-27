import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

interface EmailVerificationRequestedPayload {
  userId: string;
  email: string;
  verificationLink: string;
}

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notifications.email-verification-requested')
  async handleEmailVerificationRequested(
    @Payload() payload: EmailVerificationRequestedPayload,
  ) {
    await this.notificationsService.handleEmailVerificationRequested(payload);

    return {
      success: true,
    };
  }
}