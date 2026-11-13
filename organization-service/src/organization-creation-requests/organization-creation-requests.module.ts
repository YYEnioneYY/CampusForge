import {
  Module,
} from '@nestjs/common';

import {
  OrganizationCreationRequestsController,
} from './organization-creation-requests.controller';

import {
  OrganizationCreationRequestsRepository,
} from './organization-creation-requests.repository';

import {
  OrganizationCreationRequestsService,
} from './organization-creation-requests.service';

@Module({
  controllers: [
    OrganizationCreationRequestsController,
  ],

  providers: [
    OrganizationCreationRequestsService,
    OrganizationCreationRequestsRepository,
  ],
})
export class OrganizationCreationRequestsModule {}