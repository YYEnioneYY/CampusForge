import {
  Module,
} from '@nestjs/common';

import {
  KafkaModule,
} from '../../kafka/kafka.module';

import {
  SkillController,
} from './skill.controller';

import {
  SkillService,
} from './skill.service';

@Module({
  imports: [
    KafkaModule,
  ],

  controllers: [
    SkillController,
  ],

  providers: [
    SkillService,
  ],
})
export class SkillModule {}