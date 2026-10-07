import { ConsentType } from '../../generated/prisma/client';

export type CreateUserConsentInput = {
  userId: string;

  type: ConsentType;
  version: string;

  ipAddress: string | null;
  userAgent: string | null;
};