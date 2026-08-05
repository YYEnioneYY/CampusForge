export type ChangePasswordKafkaPayload = {
  userId: string;
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
};