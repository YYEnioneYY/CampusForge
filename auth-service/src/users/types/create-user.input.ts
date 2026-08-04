export type CreateUserInput = {
  email: string;
  passwordHash: string;
  lastLoginAt?: Date | null;
};