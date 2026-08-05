import { Module } from '@nestjs/common';

import { SecurityModule } from '../../common/security.module';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    SecurityModule,
    KafkaModule,
  ],
  controllers: [
    AdminAuthController,
  ],
  providers: [
    AdminAuthService,
  ],
})
export class AdminAuthModule {}