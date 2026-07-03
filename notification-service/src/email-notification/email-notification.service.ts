import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { TemplateService } from '../mail/template.service';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { SendPasswordChangedDto } from './dto/send-password-changed.dto';
import { SendPasswordResetDto } from './dto/send-password-reset.dto';

@Injectable()
export class EmailNotificationService {
  constructor(
    private readonly mailService: MailService,
    private readonly templateService: TemplateService,
  ) {}

  async sendEmailVerification(dto: SendEmailVerificationDto): Promise<void> {
    const html = await this.templateService.render('email-verification', {
      greeting: this.buildGreeting(dto.name),
      verificationUrl: dto.verificationUrl,
    });

    await this.mailService.sendMail({
      to: dto.email,
      subject: 'Подтверждение email',
      html,
      text: `${this.buildGreeting(dto.name)}\n\nПодтвердите email по ссылке: ${dto.verificationUrl}`,
    });
  }

  async sendPasswordReset(dto: SendPasswordResetDto): Promise<void> {
    const html = await this.templateService.render('password-reset', {
      greeting: this.buildGreeting(dto.name),
      resetUrl: dto.resetUrl,
    });

    await this.mailService.sendMail({
      to: dto.email,
      subject: 'Сброс пароля',
      html,
      text: `${this.buildGreeting(dto.name)}\n\nДля сброса пароля перейдите по ссылке: ${dto.resetUrl}`,
    });
  }

  async sendPasswordChanged(dto: SendPasswordChangedDto): Promise<void> {
    const html = await this.templateService.render('password-changed', {
      greeting: this.buildGreeting(dto.name),
    });

    await this.mailService.sendMail({
      to: dto.email,
      subject: 'Пароль изменён',
      html,
      text: `${this.buildGreeting(dto.name)}\n\nВаш пароль был успешно изменён.`,
    });
  }

  private buildGreeting(name?: string): string {
    return name ? `Здравствуйте, ${name}!` : 'Здравствуйте!';
  }
}