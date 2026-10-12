import {
  Module,
} from '@nestjs/common';

import {
  WorkExperiencesController,
} from './work-experiences.controller';

import {
  WorkExperiencesRepository,
} from './work-experiences.repository';

import {
  WorkExperiencesService,
} from './work-experiences.service';

@Module({
  controllers: [
    WorkExperiencesController,
  ],

  providers: [
    WorkExperiencesService,
    WorkExperiencesRepository,
  ],
})
export class WorkExperiencesModule {}