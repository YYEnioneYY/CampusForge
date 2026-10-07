import {
  Injectable,
} from '@nestjs/common';

import {
  ConsentType,
  Prisma,
} from '../generated/prisma/client';

import {
  ConsentRepository,
} from './consent.repository';

const PERSONAL_DATA_CONSENT_VERSION =
  '1.0';

type RecordRegistrationConsentInput = {
  userId: string;

  ipAddress: string | null;
  userAgent: string | null;
};

@Injectable()
export class ConsentService {
  constructor(
    private readonly consentRepository:
      ConsentRepository,
  ) {}

  async recordRegistrationConsent(
    input: RecordRegistrationConsentInput,
    transaction: Prisma.TransactionClient,
  ): Promise<void> {
    await this.consentRepository.createInTransaction(
      {
        userId: input.userId,
        
        type: ConsentType.PERSONALDATA,
        version: PERSONAL_DATA_CONSENT_VERSION,

        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
      transaction,
      );
  }
}