export const PROFILE_PATTERNS = {
  ME: 'profile.me',

  CHANGE_USERNAME: 'profile.username.change',
} as const;

export const PROFILE_RESPONSE_PATTERNS = [
  PROFILE_PATTERNS.ME,

  PROFILE_PATTERNS.CHANGE_USERNAME,
] as const;