import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordModule } from '../password/password.module';
import { UsersModule } from '../users/users.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { NotificationProducerModule } from '../notification-producer/notification-producer.module';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetCleanupService } from './password-reset-cleanup/password-reset-cleanup.service';

@Module({
  imports: [
    PrismaModule,
    PasswordModule,
    UsersModule,
    RefreshTokenModule,
    NotificationProducerModule,
  ],
  providers: [PasswordResetService, PasswordResetCleanupService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}