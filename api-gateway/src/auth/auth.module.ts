import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { HttpContextModule } from '../common/http/http-context.module';
import { KafkaModule } from '../kafka/kafka.module';
import { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { AuthClientContextInterceptor } from './interceptors/auth-client-context.interceptor';
import { AuthSessionCookieInterceptor } from './interceptors/auth-session-cookie.interceptor';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AccessRevocationCheckerService } from './services/access-revocation-checker.service';

@Module({
  imports: [
    KafkaModule,
    HttpContextModule,
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    AuthCookieService,

    AuthClientContextInterceptor,
    AuthSessionCookieInterceptor,

    AccessTokenGuard,
    AccessRevocationCheckerService,
  ],
})
export class AuthModule {}