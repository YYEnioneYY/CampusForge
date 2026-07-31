export type AuthenticatedUser = {
  sub: string;
  sid: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;

  iat?: number;
  exp?: number;
};