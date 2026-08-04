export type MeKafkaUser = {
  id: string;
  email: string;

  role: string;
  status: string;

  emailVerified: boolean;
  emailVerifiedAt: string | Date | null;

  lastLoginAt: string | Date | null;

  createdAt: string | Date;
  updatedAt: string | Date;
};

export type MeKafkaResponse = {
  user: MeKafkaUser;
};