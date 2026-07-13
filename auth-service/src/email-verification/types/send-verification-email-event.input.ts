export type SendVerificationEmailEventInput = {
  userId: string;
  email: string;
  verificationUrl: string;
  name?: string;
};