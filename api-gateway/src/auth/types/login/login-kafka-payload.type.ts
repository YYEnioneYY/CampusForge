export type LoginKafkaPayload = {
  email: string;
  password: string;

  deviceId: string,
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};