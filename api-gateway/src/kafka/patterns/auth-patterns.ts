export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',
} as const;

export const AUTH_RESPONSE_PATTERNS = [
  AUTH_PATTERNS.REGISTER,
  AUTH_PATTERNS.LOGIN,
  AUTH_PATTERNS.REFRESH,
] as const;