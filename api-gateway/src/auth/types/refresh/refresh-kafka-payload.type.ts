export type RefreshKafkaPayload = {
  refreshToken: string;

  deviceId: string,
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};