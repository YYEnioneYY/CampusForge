export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',

  LOGOUT: 'auth.logout',
  LOGOUT_ALL: 'auth.logout-all',
  LOGOUT_SESSION: 'auth.logout-session',

  GET_SESSIONS: 'auth.get_sessions',
} as const;

export const AUTH_RESPONSE_PATTERNS = [
  AUTH_PATTERNS.REGISTER,
  AUTH_PATTERNS.LOGIN,
  AUTH_PATTERNS.REFRESH,

  AUTH_PATTERNS.LOGOUT,
  AUTH_PATTERNS.LOGOUT_ALL,
  AUTH_PATTERNS.LOGOUT_SESSION,

  AUTH_PATTERNS.GET_SESSIONS,
] as const;