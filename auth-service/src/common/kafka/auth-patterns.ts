export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',

  LOGOUT: 'auth.logout',
  LOGOUT_ALL: 'auth.logout_all',
  LOGOUT_SESSION: 'auth.logout_session',
  GET_SESSIONS: 'auth.get_sessions',
  RENAME_SESSION: 'auth.session.rename',
  TOUCH_SESSION: 'auth.session.touch',

  VERIFY_EMAIL: 'auth.verify_email',
  RESEND_EMAIL_VERIFICATION: 'auth.resend_email_verification',

  PASSWORD_RESET_REQUEST: 'auth.password_reset.request',
  PASSWORD_RESET_CONFIRM: 'auth.password_reset.confirm',
  CHANGE_PASSWORD: 'auth.password.change',

  DELETE_ACCOUNT: 'auth.account.delete',

  ACCOUNT_RESTORE_REQUEST: 'auth.account_restore.request',
  ACCOUNT_RESTORE_CONFIRM: 'auth.account_restore.confirm',

  ME: 'auth.me',


  ADMIN_GET_USERS: 'auth.admin.users.list',
  ADMIN_BLOCK_USER: 'auth.admin.users.block',
  ADMIN_UNBLOCK_USER: 'auth.admin.users.unblock',
} as const;