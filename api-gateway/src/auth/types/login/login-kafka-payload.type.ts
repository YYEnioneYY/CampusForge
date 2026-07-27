export type LoginKafkaPayload = {
  email: string;
  password: string;

  ipAddress?: string | null;
  userAgent?: string | null;
  deviceName?: string | null;
};