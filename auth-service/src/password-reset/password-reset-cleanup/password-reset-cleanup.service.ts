import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetService } from '../password-reset.service';

@Injectable()
export class PasswordResetCleanupService {
  private readonly logger = new Logger(PasswordResetCleanupService.name);

  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredAndUsedPasswordResetTokens() {
    const deletedCount =
      await this.passwordResetService.deleteExpiredAndUsedTokens();

    this.logger.log(
      `Password reset tokens cleanup completed: ${deletedCount}`,
    );
  }
}