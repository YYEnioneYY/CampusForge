export type RegisterKafkaPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  personalDataConsent: boolean;

  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};