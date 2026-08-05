import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RedisModule } from '../redis/redis.module';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AccessRevocationCheckerService } from './services/access-revocation-checker.service';

@Module({
  imports: [
    RedisModule,
    JwtModule.register({}),
  ],
  providers: [
    AccessRevocationCheckerService,
    AccessTokenGuard,
  ],
  exports: [
    AccessRevocationCheckerService,
    AccessTokenGuard,
  ],
})
export class SecurityModule {}