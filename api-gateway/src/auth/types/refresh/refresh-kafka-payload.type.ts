export type RefreshKafkaPayload = {
  refreshToken: string;

  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};