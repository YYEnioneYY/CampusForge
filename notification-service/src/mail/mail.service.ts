import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SendMailInput } from './types/send-mail.input';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: this.getSmtpAuth(),
    });
  }

  async sendMail(input: SendMailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('MAIL_FROM'),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }

  private getSmtpAuth() {
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!user || !pass) {
      return undefined;
    }

    return {
      user,
      pass,
    };
  }
}