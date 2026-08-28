export const PROFILE_PATTERNS = {
  ME: 'profile.me',

  UPDATE_ME: 'profile.me.update',
  CHANGE_USERNAME: 'profile.username.change',

  VISIBILITY_OPTIONS: 'profile.visibility.options',
  CHANGE_VISIBILITY: 'profile.visibility.change',
} as const;

export const PROFILE_RESPONSE_PATTERNS = [
  PROFILE_PATTERNS.ME,

  PROFILE_PATTERNS.UPDATE_ME,
  PROFILE_PATTERNS.CHANGE_USERNAME,

  PROFILE_PATTERNS.VISIBILITY_OPTIONS,
  PROFILE_PATTERNS.CHANGE_VISIBILITY,
] as const;