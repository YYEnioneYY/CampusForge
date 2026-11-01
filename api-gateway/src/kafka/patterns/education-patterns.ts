export const EDUCATION_PATTERNS = {
  GET_MY: 'profile.educations.me',

  CREATE: 'profile.educations.create',

  UPDATE: 'profile.educations.update',

  DELETE: 'profile.educations.delete',

  GET_PUBLIC_BY_USERNAME: 'profile.educations.public.by-username',
} as const;

export const EDUCATION_RESPONSE_PATTERNS = [
  EDUCATION_PATTERNS.GET_MY,

  EDUCATION_PATTERNS.CREATE,

  EDUCATION_PATTERNS.UPDATE,

  EDUCATION_PATTERNS.DELETE,

  EDUCATION_PATTERNS.GET_PUBLIC_BY_USERNAME,
] as const;