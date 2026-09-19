export const PROFILE_PATTERNS = {
  ME: 'profile.me',
  SEARCH: 'profile.search',
  PUBLIC_BY_USERNAME: 'profile.public.by_username',

  UPDATE_ME: 'profile.me.update',
  CHANGE_USERNAME: 'profile.username.change',

  VISIBILITY_OPTIONS: 'profile.visibility.options',
  CHANGE_VISIBILITY: 'profile.visibility.change',

  DELETE_AVATAR: 'profile.avatar.delete',
} as const;

export const PROFILE_RESPONSE_PATTERNS = [
  PROFILE_PATTERNS.ME,
  PROFILE_PATTERNS.SEARCH,
  PROFILE_PATTERNS.PUBLIC_BY_USERNAME,

  PROFILE_PATTERNS.UPDATE_ME,
  PROFILE_PATTERNS.CHANGE_USERNAME,

  PROFILE_PATTERNS.VISIBILITY_OPTIONS,
  PROFILE_PATTERNS.CHANGE_VISIBILITY,

  PROFILE_PATTERNS.DELETE_AVATAR,
] as const;