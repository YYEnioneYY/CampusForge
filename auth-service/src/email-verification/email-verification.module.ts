import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationProducerModule } from '../notification-producer/notification-producer.module';
import { UsersModule } from '../users/users.module';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [PrismaModule, NotificationProducerModule, UsersModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}