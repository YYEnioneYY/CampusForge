import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { SecurityModule } from 'src/common/security.module';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController]
})
export class ProfileModule {}
