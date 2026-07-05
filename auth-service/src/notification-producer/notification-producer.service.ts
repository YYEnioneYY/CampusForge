import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

const NOTIFICATION_PATTERNS = {
  SEND_EMAIL_VERIFICATION: 'notification.email_verification.send',
  SEND_PASSWORD_RESET: 'notification.password_reset.send',
  SEND_PASSWORD_CHANGED: 'notification.password_changed.send',
} as const;

type SendEmailVerificationInput = {
  userId: string;
  email: string;
  verificationUrl: string;
  name?: string;
};

type SendPasswordResetInput = {
  userId: string;
  email: string;
  resetUrl: string;
  name?: string;
};

type SendPasswordChangedInput = {
  userId: string;
  email: string;
  name?: string;
};

@Injectable()
export class NotificationProducerService implements OnModuleInit {
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.notificationClient.connect();
  }

  async sendEmailVerification(input: SendEmailVerificationInput): Promise<void> {
    await lastValueFrom(
      this.notificationClient.emit(
        NOTIFICATION_PATTERNS.SEND_EMAIL_VERIFICATION,
        input,
      ),
    );
  }

  async sendPasswordReset(input: SendPasswordResetInput): Promise<void> {
    await lastValueFrom(
      this.notificationClient.emit(
        NOTIFICATION_PATTERNS.SEND_PASSWORD_RESET,
        input,
      ),
    );
  }
  
  async sendPasswordChanged(input: SendPasswordChangedInput): Promise<void> {
    await lastValueFrom(
      this.notificationClient.emit(
        NOTIFICATION_PATTERNS.SEND_PASSWORD_CHANGED,
        input,
      ),
    );
  }
}