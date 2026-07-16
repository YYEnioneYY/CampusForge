import { Module } from '@nestjs/common';
import { NotificationProducerModule } from '../notification-producer/notification-producer.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AccountRestoreRepository } from './account-restore.repository';
import { AccountRestoreService } from './account-restore.service';
import { AccountRestoreCleanupService } from './account-restore-cleanup/account-restore-cleanup.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    NotificationProducerModule,
  ],
  providers: [
    AccountRestoreRepository,
    AccountRestoreService,
    AccountRestoreCleanupService,
  ],
  exports: [
    AccountRestoreService,
  ],
})
export class AccountRestoreModule {}