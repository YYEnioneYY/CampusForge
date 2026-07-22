import { Module } from '@nestjs/common';
import { HttpContextModule } from '../common/http/http-context.module';
import { KafkaModule } from '../kafka/kafka.module';
import { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    KafkaModule,
    HttpContextModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    AuthCookieService,
  ],
})
export class AuthModule {}