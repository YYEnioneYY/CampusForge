import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NOTIFICATION_PATTERNS } from 'src/common/kafka/notification-patterns';

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

type SendAccountRestoreInput = {
  email: string;
  restoreUrl: string;
  name?: string;
}

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

  async sendAccountRestore(input: SendAccountRestoreInput): Promise<void> {
    await lastValueFrom(
      this.notificationClient.emit(
        NOTIFICATION_PATTERNS.ACCOUNT_RESTORE_SEND,
        input,
      ),
    );
  }
}