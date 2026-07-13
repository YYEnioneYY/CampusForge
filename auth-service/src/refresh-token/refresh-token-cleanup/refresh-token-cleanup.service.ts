import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RefreshTokenRepository } from '../refresh-token.repository';

@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger(
    RefreshTokenCleanupService.name,
  );

  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @Cron('0 0 * * *')
  async deleteExpiredTokens(): Promise<void> {
    try {
      const deletedCount =
        await this.refreshTokenRepository.deleteExpiredTokens(
          new Date(),
        );

      if (deletedCount > 0) {
        this.logger.log(
          `Deleted ${deletedCount} expired refresh tokens`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to delete expired refresh tokens',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    }
  }
}