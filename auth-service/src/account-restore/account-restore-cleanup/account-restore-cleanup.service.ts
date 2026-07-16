import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccountRestoreRepository } from '../account-restore.repository';

@Injectable()
export class AccountRestoreCleanupService {
  private readonly logger = new Logger(
    AccountRestoreCleanupService.name,
  );

  constructor(
    private readonly accountRestoreRepository:
      AccountRestoreRepository,
  ) {}

  @Cron('0 0 * * *')
  async deleteExpiredAndUsedTokens(): Promise<void> {
    const now = new Date();

    const usedBefore = new Date(
      now.getTime() -
        24 * 60 * 60 * 1000,
    );

    try {
      const deletedCount =
        await this.accountRestoreRepository.deleteExpiredAndOldUsedTokens(
          now,
          usedBefore,
        );

      if (deletedCount > 0) {
        this.logger.log(
          `Deleted ${deletedCount} expired or used account restore tokens`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to delete account restore tokens',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    }
  }
}