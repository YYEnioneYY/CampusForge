export const USER_SKILL_PATTERNS = {
  CREATE: 'profile.skills.create',

  DELETE: 'profile.skills.delete',

  GET_PUBLIC_BY_USERNAME: 'profile.skills.public.by-username',
} as const;

export const USER_SKILL_RESPONSE_PATTERNS = [
  USER_SKILL_PATTERNS.CREATE,

  USER_SKILL_PATTERNS.DELETE,

  USER_SKILL_PATTERNS.GET_PUBLIC_BY_USERNAME,
] as const;