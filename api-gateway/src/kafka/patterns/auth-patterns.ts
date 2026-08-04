export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',

  LOGOUT: 'auth.logout',
  LOGOUT_ALL: 'auth.logout_all',
  LOGOUT_SESSION: 'auth.logout_session',

  GET_SESSIONS: 'auth.get_sessions',
  RENAME_SESSION: 'auth.session.rename',

  VERIFY_EMAIL: 'auth.verify_email',
  RESEND_EMAIL_VERIFICATION: 'auth.resend_email_verification',

  ME: 'auth.me',
} as const;

export const AUTH_RESPONSE_PATTERNS = [
  AUTH_PATTERNS.REGISTER,
  AUTH_PATTERNS.LOGIN,
  AUTH_PATTERNS.REFRESH,

  AUTH_PATTERNS.LOGOUT,
  AUTH_PATTERNS.LOGOUT_ALL,
  AUTH_PATTERNS.LOGOUT_SESSION,

  AUTH_PATTERNS.GET_SESSIONS,
  AUTH_PATTERNS.RENAME_SESSION,

  AUTH_PATTERNS.VERIFY_EMAIL,
  AUTH_PATTERNS.RESEND_EMAIL_VERIFICATION,

  AUTH_PATTERNS.ME,
] as const;