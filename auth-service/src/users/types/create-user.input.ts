export type CreateUserInput = {
  email: string;
  phone?: string | null;
  passwordHash: string;
};