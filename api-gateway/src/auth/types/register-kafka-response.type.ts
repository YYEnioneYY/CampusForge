export type RegisterKafkaResponse = {
  user: {
    id: string;
    email: string;
    systemRole: string;
    status: string;
    emailVerifiedAt: string | Date | null;
    createdAt: string | Date;
  };

  tokens: {
    accessToken: string;
    accessTokenExpiresAt: string | Date;
    refreshToken: string;
    refreshTokenExpiresAt: string | Date;
  };
};