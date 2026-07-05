import { SystemRole, UserStatus } from '../../generated/prisma/client';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: SystemRole;
  status: UserStatus;
  emailVerified: boolean;
  sid: string;
};