import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from './auth/auth.module';
import { HttpContextModule } from './common/http/http-context.module';
import { RedisModule } from './redis/redis.module';
import { SecurityModule } from './common/security.module';
import { AdminModule } from './admin/admin.module';
import { ReferenceModule } from './reference/reference.module';
import { ProfileModule } from './profile/profile.module';
import { UserLinksModule } from './user-links/user-links.module';
import { WorkExperiencesModule } from './work-experiences/work-experiences.module';
import { UserSkillsModule } from './user-skills/user-skills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    KafkaModule,
    AuthModule,
    HttpContextModule,
    RedisModule,
    SecurityModule,
    AdminModule,
    ReferenceModule,
    ProfileModule,
    UserLinksModule,
    WorkExperiencesModule,
    UserSkillsModule,
  ],
})
export class AppModule {}