import { Module } from '@nestjs/common';

import { AdminAuthModule } from './auth/admin-auth.module';
import { OrganizationCreationRequestsModule } from './organization-creation-requests/organization-creation-requests.module';

@Module({
  imports: [
    AdminAuthModule,
    OrganizationCreationRequestsModule,
  ],
})
export class AdminModule {}