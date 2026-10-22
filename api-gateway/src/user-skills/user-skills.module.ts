import {
  Module,
} from '@nestjs/common';

import {
  SecurityModule,
} from '../common/security.module';

import {
  KafkaModule,
} from '../kafka/kafka.module';

import {
  UserSkillsController,
} from './user-skills.controller';

import {
  UserSkillsService,
} from './user-skills.service';

import {
  PublicUserSkillsController,
} from './public-user-skills.controller';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    UserSkillsController,
    PublicUserSkillsController,
  ],

  providers: [
    UserSkillsService,
  ],
})
export class UserSkillsModule {}