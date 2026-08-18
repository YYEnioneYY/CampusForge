import { Module } from '@nestjs/common';
import { ProfilesController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './profile.repository';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [ProfilesController],
  providers: [
    ProfileService,
    ProfileRepository,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}