export type RegisterKafkaPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};