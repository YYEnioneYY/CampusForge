import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationProducerModule } from '../notification-producer/notification-producer.module';
import { UsersModule } from '../users/users.module';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationCleanupService } from './email-verification-cleanup/email-verification-cleanup.service';
import { EmailVerificationRepository } from './email-verification.repository';

@Module({
  imports: [PrismaModule, NotificationProducerModule, UsersModule],
  providers: [EmailVerificationService, EmailVerificationCleanupService, EmailVerificationRepository],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}