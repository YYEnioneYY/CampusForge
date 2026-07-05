export type ChangePasswordInput = {
  userId: string;
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
};