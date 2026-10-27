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
  EducationsController,
} from './educations.controller';

import {
  EducationsService,
} from './educations.service';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    EducationsController,
  ],

  providers: [
    EducationsService,
  ],
})
export class EducationsModule {}