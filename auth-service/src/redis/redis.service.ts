import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.client = createClient({
      url: this.configService.getOrThrow<string>('REDIS_URL'),
    });

    this.client.on('error', () => {});
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  get(key: string) {
    return this.client.get(key);
  }

  set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ) {
    if (ttlSeconds) {
      return this.client.set(key, value, {
        EX: ttlSeconds,
      });
    }

    return this.client.set(key, value);
  }

  delete(key: string) {
    return this.client.del(key);
  }
}