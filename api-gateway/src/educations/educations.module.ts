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

import {
  PublicEducationsController,
} from './public-educations.controller';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    EducationsController,
    PublicEducationsController,
  ],

  providers: [
    EducationsService,
  ],
})
export class EducationsModule {}