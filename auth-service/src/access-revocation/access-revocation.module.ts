import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { AccessRevocationService } from './access-revocation.service';

@Module({
  imports: [RedisModule],
  providers: [AccessRevocationService],
  exports: [AccessRevocationService],
})
export class AccessRevocationModule {}