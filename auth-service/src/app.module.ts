import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TokenModule } from './token/token.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { PasswordModule } from './password/password.module';
import { UsersModule } from './users/users.module';

import { ScheduleModule } from '@nestjs/schedule';
import { NotificationProducerModule } from './notification-producer/notification-producer.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { validateEnv } from './config/env.validation';
import { PasswordChangeModule } from './password-change/password-change.module';
import { ProfileProducerModule } from './profile-producer/profile-producer.module';
import { AdminUsersModule } from './admin-users/admin-users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    TokenModule,
    RefreshTokenModule,
    PasswordModule,
    UsersModule,
    NotificationProducerModule,
    EmailVerificationModule,
    PasswordResetModule,
    PasswordChangeModule,
    ProfileProducerModule,
    AdminUsersModule,
  ],
})
export class AppModule {}