export const WORK_EXPERIENCE_PATTERNS = {
  GET_MY: 'profile.work-experiences.me',

  CREATE: 'profile.work-experiences.create',

  UPDATE: 'profile.work-experiences.update',
} as const;

export const WORK_EXPERIENCE_RESPONSE_PATTERNS = [
  WORK_EXPERIENCE_PATTERNS.GET_MY,

  WORK_EXPERIENCE_PATTERNS.CREATE,

  WORK_EXPERIENCE_PATTERNS.UPDATE,
] as const;