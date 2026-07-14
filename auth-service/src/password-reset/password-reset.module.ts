import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordModule } from '../password/password.module';
import { UsersModule } from '../users/users.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { NotificationProducerModule } from '../notification-producer/notification-producer.module';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetCleanupService } from './password-reset-cleanup/password-reset-cleanup.service';
import { PasswordResetRepository } from './password-reset.repository';
import { AccessRevocationModule } from 'src/access-revocation/access-revocation.module';

@Module({
  imports: [
    PrismaModule,
    PasswordModule,
    UsersModule,
    RefreshTokenModule,
    NotificationProducerModule,
    AccessRevocationModule,
  ],
  providers: [PasswordResetService, PasswordResetRepository, PasswordResetCleanupService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}