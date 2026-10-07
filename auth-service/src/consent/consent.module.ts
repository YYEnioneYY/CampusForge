import {
  Module,
} from '@nestjs/common';

import {
  ConsentRepository,
} from './consent.repository';

import {
  ConsentService,
} from './consent.service';

@Module({
  providers: [
    ConsentRepository,
    ConsentService,
  ],

  exports: [
    ConsentService,
  ],
})
export class ConsentModule {}