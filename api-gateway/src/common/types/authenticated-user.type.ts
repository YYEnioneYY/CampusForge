import { SystemRole } from "../enums/system-role.enum";

export type AuthenticatedUser = {
  sub: string;
  sid: string;
  email: string;
  role: SystemRole;
  status: string;
  emailVerified: boolean;

  iat: number;
  exp: number;
};