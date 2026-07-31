export type LogoutAllKafkaPayload = {
  refreshToken: string;
  exceptCurrent?: boolean;
};