import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailVerificationService } from '../email-verification.service';

@Injectable()
export class EmailVerificationCleanupService {
  private readonly logger = new Logger(EmailVerificationCleanupService.name);

  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredAndUsedEmailVerificationTokens() {
    const deletedCount =
      await this.emailVerificationService.deleteExpiredAndUsedTokens();

    this.logger.log(
      `Email verification tokens cleanup completed: ${deletedCount}`,
    );
  }
}