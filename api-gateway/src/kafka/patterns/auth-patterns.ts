export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
} as const;

export const AUTH_RESPONSE_PATTERNS = [
  AUTH_PATTERNS.REGISTER,
] as const;