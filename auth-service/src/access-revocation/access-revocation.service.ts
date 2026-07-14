import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AccessRevocationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async revokeSession(sessionId: string): Promise<void> {
    await this.redisService.set(
      this.getSessionRevokedKey(sessionId),
      '1',
      this.getAccessTokenTtlSeconds(),
    );
  }

  async revokeSessions(sessionIds: string[]): Promise<void> {
    if (sessionIds.length === 0) {
      return;
    }
  
    await Promise.all(
      sessionIds.map((sessionId) =>
        this.revokeSession(sessionId),
      ),
    );
  }

  async revokeUserAccessTokens(
    userId: string,
    revokedAt: Date,
  ): Promise<void> {
    const revokedAfter = Math.floor(
      revokedAt.getTime() / 1000,
    );

    await this.redisService.set(
      this.getUserRevokedAfterKey(userId),
      revokedAfter.toString(),
      this.getAccessTokenTtlSeconds(),
    );
  }

  private getSessionRevokedKey(sessionId: string): string {
    return `auth:session:revoked:${sessionId}`;
  }

  private getUserRevokedAfterKey(userId: string): string {
    return `auth:user:revoked-after:${userId}`;
  }

  private getAccessTokenTtlSeconds(): number {
    const value = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
      '15m',
    );

    return this.expiresInToSeconds(value);
  }

  private expiresInToSeconds(value: string): number {
    const match = value.trim().match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
      throw new Error(
        'Invalid JWT_ACCESS_TOKEN_EXPIRES_IN format',
      );
    }

    const amount = Number(match[1]);
    const unit = match[2];

    const multiplierMap: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return amount * multiplierMap[unit];
  }
}