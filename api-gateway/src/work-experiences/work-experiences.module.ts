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
  WorkExperiencesController,
} from './work-experiences.controller';

import {
  WorkExperiencesService,
} from './work-experiences.service';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    WorkExperiencesController,
  ],

  providers: [
    WorkExperiencesService,
  ],
})
export class WorkExperiencesModule {}