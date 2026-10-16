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

import {
  PublicWorkExperiencesController,
} from './public-work-experiences.controller';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    WorkExperiencesController,
    PublicWorkExperiencesController,
  ],

  providers: [
    WorkExperiencesService,
  ],
})
export class WorkExperiencesModule {}