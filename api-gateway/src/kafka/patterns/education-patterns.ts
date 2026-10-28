export const EDUCATION_PATTERNS = {
  GET_MY: 'profile.educations.me',

  CREATE: 'profile.educations.create',
} as const;

export const EDUCATION_RESPONSE_PATTERNS = [
  EDUCATION_PATTERNS.GET_MY,

  EDUCATION_PATTERNS.CREATE,
] as const;