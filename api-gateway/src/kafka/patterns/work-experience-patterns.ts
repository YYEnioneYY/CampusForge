export const WORK_EXPERIENCE_PATTERNS = {
  GET_MY: 'profile.work-experiences.me',

  CREATE: 'profile.work-experiences.create',

  UPDATE: 'profile.work-experiences.update',

  DELETE: 'profile.work-experiences.delete',

  GET_PUBLIC_BY_USERNAME: 'profile.work-experiences.public.by-username',
} as const;

export const WORK_EXPERIENCE_RESPONSE_PATTERNS = [
  WORK_EXPERIENCE_PATTERNS.GET_MY,

  WORK_EXPERIENCE_PATTERNS.CREATE,

  WORK_EXPERIENCE_PATTERNS.UPDATE,

  WORK_EXPERIENCE_PATTERNS.DELETE,

  WORK_EXPERIENCE_PATTERNS.GET_PUBLIC_BY_USERNAME,
] as const;