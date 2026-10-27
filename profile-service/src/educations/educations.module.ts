import {
  Module,
} from '@nestjs/common';

import {
  EducationsController,
} from './educations.controller';

import {
  EducationsRepository,
} from './educations.repository';

import {
  EducationsService,
} from './educations.service';

@Module({
  controllers: [
    EducationsController,
  ],

  providers: [
    EducationsService,
    EducationsRepository,
  ],
})
export class EducationsModule {}