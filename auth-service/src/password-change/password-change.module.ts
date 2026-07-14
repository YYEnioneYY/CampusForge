import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordModule } from '../password/password.module';
import { UsersModule } from '../users/users.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { PasswordChangeService } from './password-change.service';
import { AccessRevocationModule } from 'src/access-revocation/access-revocation.module';

@Module({
  imports: [
    PrismaModule,
    PasswordModule,
    UsersModule,
    RefreshTokenModule,
    AccessRevocationModule,
  ],
  providers: [PasswordChangeService],
  exports: [PasswordChangeService],
})
export class PasswordChangeModule {}