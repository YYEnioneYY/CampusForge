import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PasswordResetRepository } from '../password-reset.repository';

@Injectable()
export class PasswordResetCleanupService {
  private readonly logger = new Logger(
    PasswordResetCleanupService.name,
  );

  constructor(
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  @Cron('0 0 * * *')
  async deleteExpiredAndUsedTokens(): Promise<void> {
    const now = new Date();

    const usedBefore = new Date(
      now.getTime() - 24 * 60 * 60 * 1000,
    );

    try {
      const deletedCount =
        await this.passwordResetRepository.deleteExpiredAndOldUsedTokens(
          now,
          usedBefore,
        );

      if (deletedCount > 0) {
        this.logger.log(
          `Deleted ${deletedCount} expired or used password reset tokens`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to delete expired password reset tokens',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}