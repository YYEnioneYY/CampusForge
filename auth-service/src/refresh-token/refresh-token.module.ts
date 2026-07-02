import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenCleanupService } from './refresh-token-cleanup/refresh-token-cleanup.service';

@Module({
  imports: [PrismaModule],
  providers: [RefreshTokenService, RefreshTokenCleanupService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}