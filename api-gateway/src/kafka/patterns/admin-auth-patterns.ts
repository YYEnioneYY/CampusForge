export const ADMIN_AUTH_PATTERNS = {
  ADMIN_GET_USER: 'auth.admin.users.get',
} as const;

export const ADMIN_AUTH_RESPONSE_PATTERNS = [
  ADMIN_AUTH_PATTERNS.ADMIN_GET_USER,
] as const;