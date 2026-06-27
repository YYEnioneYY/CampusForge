import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '../generated/prisma/client';

interface EmailVerificationRequestedPayload {
  userId: string;
  email: string;
  verificationLink: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleEmailVerificationRequested(
    payload: EmailVerificationRequestedPayload,
  ) {
    const settings = await this.ensureNotificationSettings(payload.userId);

    if (settings.inAppEnabled) {
      await this.prisma.notification.create({
        data: {
          userId: payload.userId,
          type: NotificationType.SYSTEM_MESSAGE,
          title: 'Подтвердите почту',
          message:
            'Для завершения регистрации подтвердите вашу почту. Ссылка отправлена на email.',
          entityType: 'email_verification',
          entityId: null,
          isRead: false,
        },
      });
    }

    await this.sendEmailVerification(payload.email, payload.verificationLink);
  }

  private async ensureNotificationSettings(userId: string) {
    return this.prisma.notificationSettings.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
      },
    });
  }

  private async sendEmailVerification(
    email: string,
    verificationLink: string,
  ) {
    const html = await this.renderTemplate('email-verification.hbs', {
      verificationLink,
    });

    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT') || 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from:
        this.configService.get<string>('SMTP_FROM') ||
        'no-reply@campusforge.local',
      to: email,
      subject: 'Подтверждение почты CampusForge',
      html,
    });
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<string> {
    const templatePath = join(__dirname, 'templates', templateName);

    const templateSource = await readFile(templatePath, 'utf-8');

    const template = Handlebars.compile(templateSource);

    return template(data);
  }
}