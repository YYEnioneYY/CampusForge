export const EDUCATION_PATTERNS = {
  GET_MY: 'profile.educations.me',
} as const;

export const EDUCATION_RESPONSE_PATTERNS = [
  EDUCATION_PATTERNS.GET_MY,
] as const;