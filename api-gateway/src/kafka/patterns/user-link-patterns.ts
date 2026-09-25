export const USER_LINK_PATTERNS = {
  GET_MY: 'profile.links.me',

  CREATE: 'profile.links.create',

  UPDATE: 'profile.links.update',
  
  DELETE: 'profile.links.delete',
} as const;

export const USER_LINK_RESPONSE_PATTERNS = [
  USER_LINK_PATTERNS.GET_MY,

  USER_LINK_PATTERNS.CREATE,

  USER_LINK_PATTERNS.UPDATE,

  USER_LINK_PATTERNS.DELETE,
] as const;