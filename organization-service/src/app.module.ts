import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
} from '@nestjs/config';

import {
  validateEnv,
} from './config/env.validation';

import {
  PrismaModule,
} from './prisma/prisma.module';
import { OrganizationCreationRequestsModule } from './organization-creation-requests/organization-creation-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate:
        validateEnv,
    }),

    PrismaModule,

    OrganizationCreationRequestsModule,
  ],
})
export class AppModule {}