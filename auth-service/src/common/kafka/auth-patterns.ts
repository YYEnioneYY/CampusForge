export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',

  LOGOUT: 'auth.logout',
  LOGOUT_ALL: 'auth.logout_all',
  LOGOUT_SESSION: 'auth.logout_session',
  GET_SESSIONS: 'auth.get_sessions',

  VERIFY_EMAIL: 'auth.verify_email',
  RESEND_EMAIL_VERIFICATION: 'auth.resend_email_verification',

  PASSWORD_RESET_REQUEST: 'auth.password_reset.request',
  PASSWORD_RESET_CONFIRM: 'auth.password_reset.confirm',
  CHANGE_PASSWORD: 'auth.password.change',

  ME: 'auth.me',
} as const;