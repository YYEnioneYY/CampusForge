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


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    TokenModule,
    RefreshTokenModule,
    PasswordModule,
    UsersModule,
    NotificationProducerModule,
    EmailVerificationModule,
  ],
})
export class AppModule {}