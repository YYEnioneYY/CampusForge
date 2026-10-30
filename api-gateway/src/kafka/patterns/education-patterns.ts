export const EDUCATION_PATTERNS = {
  GET_MY: 'profile.educations.me',

  CREATE: 'profile.educations.create',

  UPDATE: 'profile.educations.update',
} as const;

export const EDUCATION_RESPONSE_PATTERNS = [
  EDUCATION_PATTERNS.GET_MY,

  EDUCATION_PATTERNS.CREATE,

  EDUCATION_PATTERNS.UPDATE,
] as const;