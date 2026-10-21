export const USER_SKILL_PATTERNS = {
  CREATE: 'profile.skills.create',

  DELETE: 'profile.skills.delete',
} as const;

export const USER_SKILL_RESPONSE_PATTERNS = [
  USER_SKILL_PATTERNS.CREATE,

  USER_SKILL_PATTERNS.DELETE,
] as const;