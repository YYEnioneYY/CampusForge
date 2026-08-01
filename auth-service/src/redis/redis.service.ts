import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    RedisService.name,
  );

  private readonly client: ReturnType<
    typeof createClient
  >;

  constructor(
    private readonly configService:
      ConfigService,
  ) {
    this.client = createClient({
      url:
        this.configService.getOrThrow<string>(
          'REDIS_URL',
        ),

      socket: {
        connectTimeout: 3_000,
      },

      disableOfflineQueue: true,
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(
        'Redis client error',
        error.stack,
      );
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  get(
    key: string,
  ): Promise<string | null> {
    return this.client.get(key);
  }

  mGet(
    keys: string[],
  ): Promise<Array<string | null>> {
    if (keys.length === 0) {
      return Promise.resolve([]);
    }

    return this.client.mGet(keys);
  }

  set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<string | null> {
    if (ttlSeconds !== undefined) {
      if (
        !Number.isInteger(ttlSeconds) ||
        ttlSeconds <= 0
      ) {
        throw new Error(
          'Redis TTL must be a positive integer',
        );
      }

      return this.client.set(
        key,
        value,
        {
          EX: ttlSeconds,
        },
      );
    }

    return this.client.set(
      key,
      value,
    );
  }

  delete(
    key: string,
  ): Promise<number> {
    return this.client.del(key);
  }
}