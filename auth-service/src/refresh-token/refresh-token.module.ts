import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenCleanupService } from './refresh-token-cleanup/refresh-token-cleanup.service';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [PrismaModule],
  providers: [RefreshTokenService, RefreshTokenRepository, RefreshTokenCleanupService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}