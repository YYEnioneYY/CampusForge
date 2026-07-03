import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

const NOTIFICATION_PATTERNS = {
  SEND_EMAIL_VERIFICATION: 'notification.email_verification.send',
} as const;

type SendEmailVerificationInput = {
  userId: string;
  email: string;
  verificationUrl: string;
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
}