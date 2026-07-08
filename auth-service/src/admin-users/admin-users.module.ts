import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { UsersModule } from '../users/users.module';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    RefreshTokenModule,
  ],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}