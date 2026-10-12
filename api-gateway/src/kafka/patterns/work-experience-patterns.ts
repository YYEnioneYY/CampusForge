export const WORK_EXPERIENCE_PATTERNS = {
  GET_MY: 'profile.work-experiences.me',
} as const;

export const WORK_EXPERIENCE_RESPONSE_PATTERNS = [
  WORK_EXPERIENCE_PATTERNS.GET_MY,
] as const;