export const USER_LINK_PATTERNS = {
  GET_MY: 'profile.links.me',

  CREATE: 'profile.links.create',

  UPDATE: 'profile.links.update',
  
  DELETE: 'profile.links.delete',

  GET_PUBLIC_BY_USERNAME: 'profile.links.public.by-username',

  REORDER: 'profile.links.reorder',
} as const;

export const USER_LINK_RESPONSE_PATTERNS = [
  USER_LINK_PATTERNS.GET_MY,

  USER_LINK_PATTERNS.CREATE,

  USER_LINK_PATTERNS.UPDATE,

  USER_LINK_PATTERNS.DELETE,

  USER_LINK_PATTERNS.GET_PUBLIC_BY_USERNAME,

  USER_LINK_PATTERNS.REORDER,
] as const;