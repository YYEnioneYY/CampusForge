import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpContextModule } from '../common/http/http-context.module';
import { KafkaModule } from '../kafka/kafka.module';
import { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { AuthClientContextInterceptor } from './interceptors/auth-client-context.interceptor';
import { AuthSessionCookieInterceptor } from './interceptors/auth-session-cookie.interceptor';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
  imports: [
    KafkaModule,
    HttpContextModule,
    JwtModule.register({}),
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
  ],
})
export class AuthModule {}