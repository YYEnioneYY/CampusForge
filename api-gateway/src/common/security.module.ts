import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RedisModule } from '../redis/redis.module';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AccessRevocationCheckerService } from './services/access-revocation-checker.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    RedisModule,
    JwtModule.register({}),
  ],
  providers: [
    AccessRevocationCheckerService,
    AccessTokenGuard,
    RolesGuard,
  ],
  exports: [
    JwtModule,
    AccessRevocationCheckerService,
    AccessTokenGuard,
    RolesGuard,
  ],
})
export class SecurityModule {}