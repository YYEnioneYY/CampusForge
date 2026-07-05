import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordModule } from '../password/password.module';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';

@Module({
  imports: [
    UsersModule,
    PasswordModule,
    TokenModule,
    RefreshTokenModule,
    EmailVerificationModule,
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}