export type CreatePasswordResetTokenResult = {
  resetUrl: string;
  expiresAt: Date;
};