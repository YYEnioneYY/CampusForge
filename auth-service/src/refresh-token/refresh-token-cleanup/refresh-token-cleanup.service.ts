import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger(RefreshTokenCleanupService.name);

  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredRefreshTokens() {
    await this.refreshTokenService.deleteExpiredTokens();

    this.logger.log('Expired refresh tokens cleanup completed');
  }
}