export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string | null;
  sid: string;
};