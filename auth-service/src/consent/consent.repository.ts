import {
  Injectable,
} from '@nestjs/common';

import {
  Prisma,
} from '../generated/prisma/client';

import {
  CreateUserConsentInput,
} from './types/create-user-consent.input';

@Injectable()
export class ConsentRepository {
  async createInTransaction(
    input: CreateUserConsentInput,
    transaction: Prisma.TransactionClient,
  ): Promise<void> {
    await transaction.userConsents.create({
      data: {
        userId: input.userId,

        type: input.type,

        version: input.version,

        ipAddress: input.ipAddress,

        userAgent: input.userAgent,
      },
    });
  }
}