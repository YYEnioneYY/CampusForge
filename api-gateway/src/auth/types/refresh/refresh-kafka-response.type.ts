export type RefreshKafkaResponse = {
  tokens: {
    accessToken: string;
    accessTokenExpiresAt: string | Date;
    refreshToken: string;
    refreshTokenExpiresAt: string | Date;
  };
};