export type ResetPasswordKafkaPayload = {
  token: string;
  newPassword: string;
};