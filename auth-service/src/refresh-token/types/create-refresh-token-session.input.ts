export type CreateRefreshTokenSessionInput = {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  deviceName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};