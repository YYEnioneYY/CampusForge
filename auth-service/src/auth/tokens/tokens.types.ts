import { SystemRole, UserStatus } from '../../generated/prisma/client';

export interface AuthTokenUser {
  id: string;
  email: string;
  systemRole: SystemRole;
  status: UserStatus;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: SystemRole;
  status: UserStatus;
  tokenType: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  jti: string;
  tokenType: 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface TokenSessionMetadata {
  deviceName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}