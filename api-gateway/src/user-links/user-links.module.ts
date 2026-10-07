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

import {
  PublicUserLinksController,
} from './public-user-links.controller';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    UserLinksController,
    PublicUserLinksController,
  ],

  providers: [
    UserLinksService,
  ],
})
export class UserLinksModule {}