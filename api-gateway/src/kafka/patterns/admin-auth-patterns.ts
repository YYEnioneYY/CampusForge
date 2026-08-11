export const ADMIN_AUTH_PATTERNS = {
  ADMIN_GET_USERS: 'auth.admin.users.list',
  ADMIN_GET_USER: 'auth.admin.users.get',

  ADMIN_BLOCK_USER: 'auth.admin.users.block',
  ADMIN_UNBLOCK_USER: 'auth.admin.users.unblock',

  ADMIN_CHANGE_USER_ROLE: 'auth.admin.users.change_role',
} as const;

export const ADMIN_AUTH_RESPONSE_PATTERNS = [
  ADMIN_AUTH_PATTERNS.ADMIN_GET_USERS,
  ADMIN_AUTH_PATTERNS.ADMIN_GET_USER,

  ADMIN_AUTH_PATTERNS.ADMIN_BLOCK_USER,
  ADMIN_AUTH_PATTERNS.ADMIN_UNBLOCK_USER,

  ADMIN_AUTH_PATTERNS.ADMIN_CHANGE_USER_ROLE,
] as const;