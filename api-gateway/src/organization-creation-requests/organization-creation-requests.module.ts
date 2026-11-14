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
  OrganizationCreationRequestsController,
} from './organization-creation-requests.controller';

import {
  OrganizationCreationRequestsService,
} from './organization-creation-requests.service';

@Module({
  imports: [
    KafkaModule,
    SecurityModule,
  ],

  controllers: [
    OrganizationCreationRequestsController,
  ],

  providers: [
    OrganizationCreationRequestsService,
  ],
})
export class OrganizationCreationRequestsModule {}