export type CreateRefreshTokenSessionInput = {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  deviceId?: string | null;
  deviceName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};