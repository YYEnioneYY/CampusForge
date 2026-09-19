export const MEDIA_PATTERNS = {
  DELETE_PROFILE_AVATAR: 'media.profile_avatar.delete',
} as const;

export const MEDIA_RESPONSE_PATTERNS = [
  MEDIA_PATTERNS.DELETE_PROFILE_AVATAR,
] as const;