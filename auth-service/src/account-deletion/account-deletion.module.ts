import { Module } from '@nestjs/common';
import { AccessRevocationModule } from '../access-revocation/access-revocation.module';
import { PasswordModule } from '../password/password.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { UsersModule } from '../users/users.module';
import { AccountDeletionService } from './account-deletion.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PasswordModule,
    RefreshTokenModule,
    AccessRevocationModule,
  ],
  providers: [AccountDeletionService],
  exports: [AccountDeletionService],
})
export class AccountDeletionModule {}