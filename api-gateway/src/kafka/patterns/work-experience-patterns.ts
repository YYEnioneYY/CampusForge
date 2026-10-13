export const WORK_EXPERIENCE_PATTERNS = {
  GET_MY: 'profile.work-experiences.me',

  CREATE: 'profile.work-experiences.create',
} as const;

export const WORK_EXPERIENCE_RESPONSE_PATTERNS = [
  WORK_EXPERIENCE_PATTERNS.GET_MY,

  WORK_EXPERIENCE_PATTERNS.CREATE,
] as const;