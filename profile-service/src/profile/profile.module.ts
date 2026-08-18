import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfilesController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './profile.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProfilesController],
  providers: [
    ProfileService,
    ProfileRepository,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}