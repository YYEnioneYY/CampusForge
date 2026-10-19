import {
  Module,
} from '@nestjs/common';

import {
  KafkaModule,
} from '../kafka/kafka.module';

import {
  UserSkillsController,
} from './user-skills.controller';

import {
  UserSkillsRepository,
} from './user-skills.repository';

import {
  UserSkillsService,
} from './user-skills.service';

@Module({
  imports: [
    KafkaModule,
  ],

  controllers: [
    UserSkillsController,
  ],

  providers: [
    UserSkillsService,
    UserSkillsRepository,
  ],
})
export class UserSkillsModule {}