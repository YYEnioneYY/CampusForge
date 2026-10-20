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

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    UserSkillsController,
  ],

  providers: [
    UserSkillsService,
  ],
})
export class UserSkillsModule {}