import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { RedisService } from '../../redis/redis.service';
import type { AuthenticatedUser } from '../types/authenticated-user.type';
import { 
  getSessionRevokedKey, 
  getUserRevokedAfterKey,
} from '../constants/access-revocation-keys';

@Injectable()
export class AccessRevocationCheckerService {
  private readonly logger = new Logger(
    AccessRevocationCheckerService.name,
  );

  constructor(
    private readonly redisService:
      RedisService,
  ) {}

  async assertAccessAllowed(
    payload: AuthenticatedUser,
  ): Promise<void> {
    const sessionRevokedKey =
      getSessionRevokedKey(
        payload.sid,
      );

    const userRevokedAfterKey =
      getUserRevokedAfterKey(
        payload.sub,
      );

    let sessionRevoked: string | null;
    let userRevokedAfterValue: string | null;

    try {
      [
        sessionRevoked,
        userRevokedAfterValue,
      ] = await this.redisService.mGet([
        sessionRevokedKey,
        userRevokedAfterKey,
      ]);
    } catch (error) {
      this.logger.error(
        'Failed to check access-token revocation',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new ServiceUnavailableException(
        'Authentication state is temporarily unavailable',
      );
    }

    if (sessionRevoked !== null) {
      throw new UnauthorizedException(
        'Session has been revoked',
      );
    }

    if (userRevokedAfterValue === null) {
      return;
    }

    const userRevokedAfter = Number(
      userRevokedAfterValue,
    );

    if (
      !Number.isInteger(userRevokedAfter) ||
      userRevokedAfter < 0
    ) {
      this.logger.error(
        'Invalid revoked-after value in Redis',
      );

      throw new ServiceUnavailableException(
        'Authentication state is temporarily unavailable',
      );
    }

    if (payload.iat <= userRevokedAfter) {
      throw new UnauthorizedException(
        'Access token has been revoked',
      );
    }
  }
}