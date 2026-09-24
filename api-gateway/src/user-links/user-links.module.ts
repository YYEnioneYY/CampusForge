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
  UserLinksController,
} from './user-links.controller';

import {
  UserLinksService,
} from './user-links.service';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    UserLinksController,
  ],

  providers: [
    UserLinksService,
  ],
})
export class UserLinksModule {}