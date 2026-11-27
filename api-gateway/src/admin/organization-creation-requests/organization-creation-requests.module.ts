import { Module } from '@nestjs/common';
import { OrganizationCreationRequestsService } from './organization-creation-requests.service';
import { OrganizationCreationRequestsController } from './organization-creation-requests.controller';

@Module({
  providers: [OrganizationCreationRequestsService],
  controllers: [OrganizationCreationRequestsController]
})
export class OrganizationCreationRequestsModule {}
