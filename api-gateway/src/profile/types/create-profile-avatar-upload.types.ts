export type CreateProfileAvatarUploadPayload = {
  userId: string;
};

export type CreateProfileAvatarUploadResponse = {
  uploadUrl: string;
  expiresAt: string;
};