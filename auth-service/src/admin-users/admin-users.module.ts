import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { UsersModule } from '../users/users.module';
import { AdminUsersService } from './admin-users.service';
import { AccessRevocationModule } from 'src/access-revocation/access-revocation.module';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    RefreshTokenModule,
    AccessRevocationModule,
  ],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}