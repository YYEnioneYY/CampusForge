export type GetSessionsKafkaSession = {
  id: string;
  deviceName: string | null;
  sessionName: string | null;
  ipAddress: string | null;
  userAgent: string | null;

  expiresAt: string | Date;
  lastSeenAt: string | Date;
  createdAt: string | Date;

  isCurrent: boolean;
};

export type GetSessionsKafkaResponse = {
  sessions: GetSessionsKafkaSession[];
};