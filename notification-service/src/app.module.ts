import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { EmailNotificationModule } from './email-notification/email-notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailModule,
    EmailNotificationModule,
  ],
})
export class AppModule {}