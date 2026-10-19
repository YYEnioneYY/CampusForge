import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { KafkaModule } from './kafka/kafka.module';
import { UserLinksModule } from './user-links/user-links.module';
import { WorkExperiencesModule } from './work-experiences/work-experiences.module';
import { UserSkillsModule } from './user-skills/user-skills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    ProfileModule,
    KafkaModule,
    UserLinksModule,
    WorkExperiencesModule,
    UserSkillsModule,
  ],
})
export class AppModule {}