import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export const NOTIFICATIONS_KAFKA_CLIENT = 'NOTIFICATIONS_KAFKA_CLIENT';

interface EmailVerificationRequestedPayload {
  userId: string;
  email: string;
  verificationLink: string;
}

@Injectable()
export class NotificationsService
  implements OnModuleInit, OnApplicationShutdown
{
  constructor(
    @Inject(NOTIFICATIONS_KAFKA_CLIENT)
    private readonly client: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async onApplicationShutdown() {
    await this.client.close();
  }

  async sendEmailVerificationRequested(
    payload: EmailVerificationRequestedPayload,
  ) {
    await lastValueFrom(
      this.client.emit('notifications.email-verification-requested', payload),
    );
  }
}