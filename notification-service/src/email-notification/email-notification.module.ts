import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { EmailNotificationController } from './email-notification.controller';
import { EmailNotificationService } from './email-notification.service';

@Module({
  imports: [MailModule],
  controllers: [EmailNotificationController],
  providers: [EmailNotificationService],
})
export class EmailNotificationModule {}