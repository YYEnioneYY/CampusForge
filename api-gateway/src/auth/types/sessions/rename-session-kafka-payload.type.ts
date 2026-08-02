export type RenameSessionKafkaPayload = {
  userId: string;
  currentSessionId: string;
  sessionId: string;
  sessionName: string;
};